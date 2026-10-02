import type { Attachment } from "svelte/attachments";

const linkPath =
	"M13.0607 8.11097L14.4749 9.52518C17.2086 12.2589 17.2086 16.691 14.4749 19.4247L14.1214 19.7782C11.3877 22.5119 6.95555 22.5119 4.22188 19.7782C1.48821 17.0446 1.48821 12.6124 4.22188 9.87874L5.6361 11.293C3.68348 13.2456 3.68348 16.4114 5.6361 18.364C7.58872 20.3166 10.7545 20.3166 12.7072 18.364L13.0607 18.0105C15.0133 16.0578 15.0133 12.892 13.0607 10.9394L11.6465 9.52518L13.0607 8.11097ZM19.7782 14.1214L18.364 12.7072C20.3166 10.7545 20.3166 7.58872 18.364 5.6361C16.4114 3.68348 13.2456 3.68348 11.293 5.6361L10.9394 5.98965C8.98678 7.94227 8.98678 11.1081 10.9394 13.0607L12.3536 14.4749L10.9394 15.8891L9.52518 14.4749C6.79151 11.7413 6.79151 7.30911 9.52518 4.57544L9.87874 4.22188C12.6124 1.48821 17.0446 1.48821 19.7782 4.22188C22.5119 6.95555 22.5119 11.3877 19.7782 14.1214Z";

const checkPath =
	"M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z";

function createIcon(path: string, name: "link" | "check") {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("fill", "currentColor");
	svg.setAttribute("aria-hidden", "true");
	svg.dataset.icon = name;
	svg.classList.add("heading-link-icon");

	const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
	shape.setAttribute("d", path);
	svg.append(shape);
	return svg;
}

export const enhanceHeadingLinks: Attachment = (element) => {
	if (!element.hasAttribute("data-heading-links")) {
		return;
	}

	const status = document.createElement("p");
	status.className = "sr-only";
	status.setAttribute("role", "status");
	status.setAttribute("aria-atomic", "true");
	element.append(status);

	const timers = new Map<HTMLButtonElement, number>();
	const buttons: HTMLButtonElement[] = [];

	for (const heading of element.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]")) {
		if (!heading.id || heading.querySelector(".heading-link")) {
			continue;
		}

		const button = document.createElement("button");
		button.type = "button";
		button.className = "heading-link";
		button.setAttribute("aria-label", "이 섹션 주소 복사");
		button.append(createIcon(linkPath, "link"), createIcon(checkPath, "check"));

		const reset = () => {
			button.removeAttribute("data-copied");
			button.setAttribute("aria-label", "이 섹션 주소 복사");
			if (status.dataset.owner === heading.id) {
				status.textContent = "";
				delete status.dataset.owner;
			}
		};

		button.addEventListener("click", async () => {
			const url = new URL(window.location.href);
			url.hash = heading.id;

			try {
				await navigator.clipboard.writeText(url.toString());
			} catch {
				return;
			}

			history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
			button.dataset.copied = "true";
			button.setAttribute("aria-label", "이 섹션 주소를 복사했습니다");
			status.dataset.owner = heading.id;
			status.textContent = "이 섹션 주소를 복사했습니다.";

			const previous = timers.get(button);
			if (previous) {
				window.clearTimeout(previous);
			}
			timers.set(button, window.setTimeout(reset, 1500));
		});

		heading.append(button);
		buttons.push(button);
	}

	return () => {
		for (const timer of timers.values()) {
			window.clearTimeout(timer);
		}
		for (const button of buttons) {
			button.remove();
		}
		status.remove();
	};
};
