<script lang="ts">
	import RiMoonLine from "remixicon-svelte/icons/moon-line";
	import RiSunLine from "remixicon-svelte/icons/sun-line";
	import { toggleMode } from "mode-watcher";
	import { Button } from "$lib/components/ui/button/index.js";
</script>

<Button
	onclick={toggleMode}
	variant="outline"
	size="icon"
	class="relative"
	aria-label="테마 전환"
>
	<RiSunLine class="scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90" />
	<RiMoonLine class="absolute scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0" />
</Button>
