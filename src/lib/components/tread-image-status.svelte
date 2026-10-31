<script lang="ts">
	import { getEmblaContext } from "$lib/components/ui/carousel/context.js";

	let { total }: { total: number } = $props();

	const emblaCtx = getEmblaContext("TreadImageStatus");
</script>

<p
	class="bg-background/80 absolute end-3 top-3 rounded-md px-2 py-0.5 text-xs tabular-nums"
	aria-live="polite"
>
	{emblaCtx.selectedIndex + 1} / {total}
</p>
