<script lang="ts">
	import { base } from "$app/paths";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import type { TreadImage } from "$lib/types";

	let { images }: { images: TreadImage[] } = $props();

	function srcFor(image: TreadImage) {
		if (/^https?:\/\//.test(image.src)) {
			return image.src;
		}

		return `${base}${image.src}`;
	}

	const cover = $derived(images[0]);
</script>

{#if cover}
	<div class="relative aspect-[4/3] overflow-hidden bg-muted">
		<img
			src={srcFor(cover)}
			alt={cover.alt}
			class="size-full object-cover"
			loading="lazy"
			decoding="async"
		/>
		{#if images.length > 1}
			<Badge
				variant="secondary"
				class="absolute end-3 top-3 bg-background/80"
				aria-label="{images.length}장의 이미지"
			>
				{images.length}
			</Badge>
		{/if}
	</div>
{/if}
