<script lang="ts">
	import { onDestroy } from "svelte";
	import RiCheckLine from "remixicon-svelte/icons/check-line";
	import RiLinksLine from "remixicon-svelte/icons/links-line";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import { floatingActionButtonClass } from "./back-to-top.svelte";

	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyPageUrl() {
		try {
			await navigator.clipboard.writeText(window.location.href);
		} catch {
			return;
		}

		copied = true;
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => {
			copied = false;
		}, 1500);
	}

	onDestroy(() => {
		clearTimeout(resetTimer);
	});
</script>

<Button
	type="button"
	variant="outline"
	size="icon-lg"
	class={cn(
		floatingActionButtonClass,
		"relative",
		copied &&
			"text-primary shadow-primary/35 ring-primary hover:text-primary hover:ring-primary dark:text-primary dark:shadow-primary/55 dark:ring-primary dark:hover:text-primary dark:hover:ring-primary",
	)}
	aria-label={copied ? "글 주소를 복사했습니다" : "글 주소 복사"}
	onclick={copyPageUrl}
>
	<RiLinksLine
		class={cn("scale-100 rotate-0 !transition-all", copied && "scale-0 -rotate-90")}
		aria-hidden="true"
	/>
	<RiCheckLine
		class={cn("absolute scale-0 rotate-90 !transition-all", copied && "scale-100 rotate-0")}
		aria-hidden="true"
	/>
</Button>
<span class="sr-only" role="status">{copied ? "글 주소를 복사했습니다." : ""}</span>
