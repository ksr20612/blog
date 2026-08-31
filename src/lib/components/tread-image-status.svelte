<script lang="ts">
	import { getEmblaContext } from "$lib/components/ui/carousel/context.js";

	let { total }: { total: number } = $props();

	const emblaCtx = getEmblaContext("TreadImageStatus");
</script>

<p class="text-muted-foreground mt-2 text-center text-xs" aria-live="polite">
	{emblaCtx.selectedIndex + 1} / {total}
</p>
