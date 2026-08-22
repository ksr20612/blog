import type { Attachment } from "svelte/attachments";

export const enhanceCodeBlocks: Attachment = (element) => {
	const blocks = element.querySelectorAll("pre.shiki");
	const buttons: HTMLButtonElement[] = [];

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
		button.textContent = "복사";
		button.addEventListener("click", async () => {
			const code =
				pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
			await navigator.clipboard.writeText(code);
			button.textContent = "복사됨";
			window.setTimeout(() => {
				button.textContent = "복사";
			}, 1500);
		});
		wrap.append(button);
		buttons.push(button);
	}

	return () => {
		for (const button of buttons) {
			button.remove();
		}
	};
};
