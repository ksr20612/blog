import type { Attachment } from "svelte/attachments";

const checkPath =
	"M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z";

function createCheckIcon() {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("fill", "currentColor");
	svg.setAttribute("aria-hidden", "true");
	svg.dataset.icon = "check";

	const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
	shape.setAttribute("d", checkPath);
	svg.append(shape);
	return svg;
}

export const enhanceCodeBlocks: Attachment = (element) => {
	const blocks = element.querySelectorAll("pre.shiki");
	const buttons: HTMLButtonElement[] = [];
	const timers = new Map<HTMLButtonElement, number>();

	for (const pre of blocks) {
		if (pre.parentElement?.classList.contains("code-block")) {
			continue;
		}

		const wrap = document.createElement("div");
		wrap.className = "code-block";
		pre.parentNode?.insertBefore(wrap, pre);
		wrap.append(pre);

		const button = document.createElement("button");
		button.type = "button";
		button.className = "code-copy";

		const label = document.createElement("span");
		label.textContent = "복사";
		button.append(createCheckIcon(), label);

		const reset = () => {
			button.removeAttribute("data-copied");
			label.textContent = "복사";
			timers.delete(button);
		};

		button.addEventListener("click", async () => {
			const code =
				pre.querySelector("code")?.textContent ?? pre.textContent ?? "";

			try {
				await navigator.clipboard.writeText(code);
			} catch {
				return;
			}

			button.dataset.copied = "true";
			label.textContent = "복사됨";

			const previous = timers.get(button);
			if (previous) {
				window.clearTimeout(previous);
			}
			timers.set(button, window.setTimeout(reset, 1500));
		});

		wrap.append(button);
		buttons.push(button);
	}

	return () => {
		for (const timer of timers.values()) {
			window.clearTimeout(timer);
		}
		for (const button of buttons) {
			button.remove();
		}
	};
};
