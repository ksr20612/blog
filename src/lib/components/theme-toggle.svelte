<script lang="ts">
	import RiMoonLine from "remixicon-svelte/icons/moon-line";
	import RiSunLine from "remixicon-svelte/icons/sun-line";
	import { mode, toggleMode } from "mode-watcher";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";

	let { class: className = "" }: { class?: string } = $props();
	const isDark = $derived(mode.current === "dark");
</script>

<Button
	type="button"
	role="switch"
	aria-checked={isDark}
	onclick={toggleMode}
	variant="outline"
	size="icon"
	class={cn("relative", className)}
	aria-label="다크 모드"
>
	<RiSunLine class="scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90" aria-hidden="true" />
	<RiMoonLine class="absolute scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0" aria-hidden="true" />
</Button>
