import type { Attachment } from "svelte/attachments";

const zoomPath =
	"M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748ZM10 10V7H12V10H15V12H12V15H10V12H7V10H10Z";

const closePath =
	"M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z";

const plusPath = "M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z";

const minusPath = "M5 11H19V13H5V11Z";

const fitPath =
	"M3 8V3H8V5H5V8H3ZM16 3H21V8H19V5H16V3ZM5 16V19H8V21H3V16H5ZM19 19V16H21V21H16V19H19Z";

const ZOOM_STEP = 1.25;

let lockCount = 0;
let savedPadding = "";

type ZoomIntent = "overview" | "fit" | "custom";

type ZoomLimits = {
	fit: number;
	overview: number;
	min: number;
	max: number;
};

function createIcon(path: string) {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("width", "18");
	svg.setAttribute("height", "18");
	svg.setAttribute("fill", "currentColor");
	svg.setAttribute("aria-hidden", "true");

	const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
	shape.setAttribute("d", path);
	svg.append(shape);
	return svg;
}

function createControl(label: string, shortcut: string, path: string) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "image-zoom-control";
	button.setAttribute("aria-label", label);
	button.setAttribute("aria-keyshortcuts", shortcut);
	button.append(createIcon(path));
	return button;
}

function imageText(img: HTMLImageElement) {
	const alt = img.alt.trim();
	if (alt) {
		return alt;
	}

	return (
		img.closest("figure")?.querySelector("figcaption")?.textContent?.trim() ??
		""
	);
}

function isContentImage(img: HTMLImageElement) {
	if (!img.getAttribute("src")) {
		return false;
	}

	return !img.closest("a, button, dialog");
}

function near(left: number, right: number) {
	return Math.abs(left - right) <= Math.max(0.02, Math.abs(right) * 0.02);
}

function lockPage() {
	lockCount += 1;
	if (lockCount > 1) {
		return;
	}

	const root = document.documentElement;
	const gap = window.innerWidth - root.clientWidth;
	savedPadding = root.style.paddingRight;
	if (gap > 0) {
		root.style.paddingRight = `${gap}px`;
	}
	root.dataset.imageZoom = "open";
}

function unlockPage() {
	lockCount = Math.max(0, lockCount - 1);
	if (lockCount > 0) {
		return;
	}

	const root = document.documentElement;
	delete root.dataset.imageZoom;
	root.style.paddingRight = savedPadding;
}

export const enhanceImageZoom: Attachment<HTMLElement> = (element) => {
	const images = [...element.querySelectorAll<HTMLImageElement>("img")].filter(
		isContentImage,
	);
	if (images.length === 0) {
		return;
	}

	const dialog = document.createElement("dialog");
	dialog.className = "image-zoom";
	dialog.setAttribute("aria-label", "확대 보기");

	const stage = document.createElement("div");
	stage.className = "image-zoom-stage";
	stage.tabIndex = 0;
	stage.setAttribute("role", "group");

	const frame = document.createElement("div");
	frame.className = "image-zoom-frame";

	const preview = document.createElement("img");
	preview.alt = "";
	preview.decoding = "async";

	const status = document.createElement("p");
	status.className = "sr-only";
	status.setAttribute("role", "status");
	status.setAttribute("aria-live", "polite");

	const zoomOut = createControl("축소", "-", minusPath);
	const fitButton = createControl("화면에 맞추기", "0", fitPath);
	const zoomIn = createControl("확대", "+", plusPath);

	const toolbar = document.createElement("div");
	toolbar.className = "image-zoom-toolbar";
	toolbar.setAttribute("role", "group");
	toolbar.setAttribute("aria-label", "이미지 크기");
	toolbar.append(zoomOut, fitButton, zoomIn);

	const close = document.createElement("button");
	close.type = "button";
	close.className = "image-zoom-close";
	close.setAttribute("aria-label", "닫기");
	close.append(createIcon(closePath));

	frame.append(preview);
	stage.append(frame);
	dialog.append(stage, toolbar, close, status);
	document.body.append(dialog);

	let activeTrigger: HTMLButtonElement | null = null;
	let restoreFocus = true;
	let scale = 1;
	let intent: ZoomIntent = "overview";
	let ignoreClick = false;
	const buttons: HTMLButtonElement[] = [];
	const pointers = new Map<number, { x: number; y: number }>();
	let pinch: { distance: number; scale: number } | null = null;
	let pinchChanged = false;
	let pointerOrigin: { x: number; y: number } | null = null;
	let announced = "";

	const availableSize = () => {
		const style = getComputedStyle(frame);
		const padX =
			Number.parseFloat(style.paddingLeft) +
			Number.parseFloat(style.paddingRight);
		const padY =
			Number.parseFloat(style.paddingTop) +
			Number.parseFloat(style.paddingBottom);
		return {
			width: Math.max(stage.clientWidth - padX, 1),
			height: Math.max(stage.clientHeight - padY, 1),
		};
	};

	const limitsFor = (): ZoomLimits | null => {
		const naturalWidth = preview.naturalWidth;
		const naturalHeight = preview.naturalHeight;
		if (naturalWidth === 0 || naturalHeight === 0) {
			return null;
		}

		const available = availableSize();
		const fit = Math.min(
			available.width / naturalWidth,
			available.height / naturalHeight,
		);
		const overview = Math.min(fit, 1);
		return {
			fit,
			overview,
			min: overview,
			max: fit > 1 ? Math.max(fit, 2) : 1,
		};
	};

	const scaleText = (limits: ZoomLimits) => {
		if (near(scale, limits.fit)) {
			return "화면 맞춤";
		}
		if (near(scale, 1)) {
			return "원본 크기";
		}
		return `원본의 ${Math.round(scale * 100)}%`;
	};

	const updateControls = () => {
		const limits = limitsFor();
		if (!limits) {
			return;
		}

		zoomOut.disabled = scale <= limits.min || near(scale, limits.min);
		zoomIn.disabled = scale >= limits.max || near(scale, limits.max);
		fitButton.disabled = near(scale, limits.fit);
	};

	const announce = () => {
		const limits = limitsFor();
		if (!limits) {
			return;
		}
		const text = scaleText(limits);
		if (text === announced) {
			return;
		}
		announced = text;
		status.textContent = text;
	};

	const renderScale = (
		next: number,
		focal?: { x: number; y: number },
		shouldAnnounce = false,
	) => {
		const limits = limitsFor();
		if (!limits) {
			return;
		}

		const clamped = Math.min(limits.max, Math.max(limits.min, next));
		const previous = scale;
		const stageRect = stage.getBoundingClientRect();
		const imageRect = preview.getBoundingClientRect();
		const focalX = focal?.x ?? stage.clientWidth / 2;
		const focalY = focal?.y ?? stage.clientHeight / 2;
		const relativeX =
			imageRect.width > 0
				? (stageRect.left + focalX - imageRect.left) / imageRect.width
				: 0.5;
		const relativeY =
			imageRect.height > 0
				? (stageRect.top + focalY - imageRect.top) / imageRect.height
				: 0.5;

		scale = clamped;
		preview.style.width = `${preview.naturalWidth * scale}px`;
		preview.style.height = `${preview.naturalHeight * scale}px`;

		if (imageRect.width > 0 && !near(previous, clamped)) {
			const nextRect = preview.getBoundingClientRect();
			const nextStage = stage.getBoundingClientRect();
			const offsetX = nextRect.left - nextStage.left + stage.scrollLeft;
			const offsetY = nextRect.top - nextStage.top + stage.scrollTop;
			stage.scrollLeft = offsetX + relativeX * nextRect.width - focalX;
			stage.scrollTop = offsetY + relativeY * nextRect.height - focalY;
		}

		updateControls();
		if (shouldAnnounce && !near(previous, clamped)) {
			announce();
		}
	};

	const applyIntent = (shouldAnnounce = false) => {
		const limits = limitsFor();
		if (!limits) {
			return;
		}

		if (intent === "fit") {
			renderScale(limits.fit, undefined, shouldAnnounce);
			return;
		}
		if (intent === "overview") {
			renderScale(limits.overview, undefined, shouldAnnounce);
			return;
		}
		renderScale(scale, undefined, shouldAnnounce);
	};

	const zoomBy = (factor: number, focal?: { x: number; y: number }) => {
		intent = "custom";
		renderScale(scale * factor, focal, true);
	};

	const fitToScreen = () => {
		intent = "fit";
		applyIntent(true);
	};

	const onDialogClose = () => {
		unlockPage();
		preview.removeAttribute("src");
		preview.style.removeProperty("width");
		preview.style.removeProperty("height");
		stage.removeAttribute("aria-label");
		status.textContent = "";
		announced = "";
		pointers.clear();
		pinch = null;
		const trigger = activeTrigger;
		activeTrigger = null;
		if (restoreFocus && trigger?.isConnected) {
			trigger.focus({ preventScroll: true });
		}
	};

	const requestClose = () => {
		if (dialog.open) {
			dialog.close();
		}
	};

	const open = (img: HTMLImageElement, trigger: HTMLButtonElement) => {
		activeTrigger = trigger;
		intent = "overview";
		stage.setAttribute("aria-label", imageText(img) || "이미지");
		const src = img.currentSrc || img.src;
		if (preview.src !== src) {
			preview.style.removeProperty("width");
			preview.style.removeProperty("height");
			preview.src = src;
		}
		if (!dialog.open) {
			dialog.showModal();
			lockPage();
		}
		stage.scrollTo(0, 0);
		stage.focus({ preventScroll: true });
		requestAnimationFrame(() => applyIntent());
	};

	stage.addEventListener("click", (event) => {
		if (ignoreClick) {
			ignoreClick = false;
			return;
		}
		if (event.target !== preview) {
			requestClose();
		}
	});
	stage.addEventListener("keydown", (event) => {
		const page = Math.max(stage.clientHeight * 0.85, 64);
		if (event.key === "ArrowDown") {
			stage.scrollBy({ top: 64 });
		} else if (event.key === "ArrowUp") {
			stage.scrollBy({ top: -64 });
		} else if (event.key === "ArrowRight") {
			stage.scrollBy({ left: 64 });
		} else if (event.key === "ArrowLeft") {
			stage.scrollBy({ left: -64 });
		} else if (event.key === "PageDown") {
			stage.scrollBy({ top: page });
		} else if (event.key === "PageUp") {
			stage.scrollBy({ top: -page });
		} else if (event.key === "Home") {
			stage.scrollTo({ left: 0, top: 0 });
		} else if (event.key === "End") {
			stage.scrollTo({ left: stage.scrollWidth, top: stage.scrollHeight });
		} else {
			return;
		}
		event.preventDefault();
	});
	stage.addEventListener(
		"wheel",
		(event) => {
			if (!event.ctrlKey && !event.metaKey) {
				return;
			}
			event.preventDefault();
			const rect = stage.getBoundingClientRect();
			zoomBy(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			});
		},
		{ passive: false },
	);

	const pointerDistance = () => {
		const points = [...pointers.values()];
		const first = points[0];
		const second = points[1];
		if (!first || !second) {
			return 0;
		}
		return Math.hypot(first.x - second.x, first.y - second.y);
	};

	stage.addEventListener("pointerdown", (event) => {
		if (pointers.size === 0) {
			ignoreClick = false;
			pointerOrigin = { x: event.clientX, y: event.clientY };
		}
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
		if (pointers.size === 2) {
			pinch = { distance: pointerDistance(), scale };
			pinchChanged = false;
			ignoreClick = true;
		}
	});
	stage.addEventListener("pointermove", (event) => {
		const previous = pointers.get(event.pointerId);
		if (!previous) {
			return;
		}
		if (
			pointerOrigin &&
			Math.hypot(
				event.clientX - pointerOrigin.x,
				event.clientY - pointerOrigin.y,
			) > 8
		) {
			ignoreClick = true;
		}
		pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
		if (!pinch || pointers.size < 2 || pinch.distance <= 0) {
			return;
		}

		event.preventDefault();
		const rect = stage.getBoundingClientRect();
		const points = [...pointers.values()];
		const first = points[0];
		const second = points[1];
		if (!first || !second) {
			return;
		}
		intent = "custom";
		pinchChanged = true;
		renderScale(
			pinch.scale * (pointerDistance() / pinch.distance),
			{
				x: (first.x + second.x) / 2 - rect.left,
				y: (first.y + second.y) / 2 - rect.top,
			},
			false,
		);
	});
	const endPointer = (event: PointerEvent) => {
		pointers.delete(event.pointerId);
		if (pointers.size === 0) {
			pointerOrigin = null;
		}
		if (pointers.size < 2) {
			if (pinchChanged) {
				announce();
			}
			pinch = null;
			pinchChanged = false;
		}
	};
	stage.addEventListener("pointerup", endPointer);
	stage.addEventListener("pointercancel", endPointer);

	zoomOut.addEventListener("click", () => zoomBy(1 / ZOOM_STEP));
	zoomIn.addEventListener("click", () => zoomBy(ZOOM_STEP));
	fitButton.addEventListener("click", fitToScreen);
	close.addEventListener("click", requestClose);
	dialog.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			event.preventDefault();
			requestClose();
			return;
		}
		if (event.altKey || event.ctrlKey || event.metaKey) {
			return;
		}
		if (event.key === "+" || event.key === "=") {
			event.preventDefault();
			zoomBy(ZOOM_STEP);
			return;
		}
		if (event.key === "-" || event.key === "_") {
			event.preventDefault();
			zoomBy(1 / ZOOM_STEP);
			return;
		}
		if (event.key === "0") {
			event.preventDefault();
			fitToScreen();
		}
	});
	dialog.addEventListener("close", onDialogClose);
	preview.addEventListener("load", () => {
		if (dialog.open) {
			applyIntent();
		}
	});

	let stageSize = "";
	const resizeObserver = new ResizeObserver(() => {
		if (!dialog.open) {
			return;
		}
		const nextSize = `${stage.clientWidth}x${stage.clientHeight}`;
		if (nextSize === stageSize) {
			return;
		}
		stageSize = nextSize;
		applyIntent();
	});
	resizeObserver.observe(stage);

	for (const img of images) {
		const parent = img.parentNode;
		if (!parent) {
			continue;
		}

		const button = document.createElement("button");
		button.type = "button";
		button.className = "image-zoom-trigger";
		button.setAttribute("aria-haspopup", "dialog");
		const text = imageText(img);
		button.setAttribute(
			"aria-label",
			text ? `${text}, 확대 보기` : "이미지 확대 보기",
		);

		const icon = document.createElement("span");
		icon.className = "image-zoom-icon";
		icon.setAttribute("aria-hidden", "true");
		const glyph = createIcon(zoomPath);
		glyph.setAttribute("width", "14");
		glyph.setAttribute("height", "14");
		icon.append(glyph);

		parent.insertBefore(button, img);
		button.append(img, icon);
		button.addEventListener("click", () => open(img, button));
		buttons.push(button);
	}

	return () => {
		restoreFocus = false;
		resizeObserver.disconnect();
		if (dialog.open) {
			dialog.close();
		}
		dialog.remove();
		for (const button of buttons) {
			const image = button.querySelector("img");
			if (image && button.isConnected) {
				button.replaceWith(image);
			}
		}
	};
};
