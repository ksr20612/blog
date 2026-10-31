<script lang="ts">
	import { base } from "$app/paths";
	import * as Carousel from "$lib/components/ui/carousel/index.js";
	import type { TreadImage } from "$lib/types";
	import TreadImageStatus from "./tread-image-status.svelte";

	let { images }: { images: TreadImage[] } = $props();

	function srcFor(image: TreadImage) {
		if (/^https?:\/\//.test(image.src)) {
			return image.src;
		}

		return `${base}${image.src}`;
	}

	const cover = $derived(images[0]);
	const hasGallery = $derived(images.length > 1);
</script>

{#snippet frame(image: TreadImage)}
	<div class="relative aspect-[4/3] overflow-hidden bg-muted">
		<img
			src={srcFor(image)}
			alt={image.alt}
			class="size-full object-cover"
			loading="lazy"
			decoding="async"
		/>
	</div>
{/snippet}

{#if hasGallery}
	<Carousel.Root class="relative" opts={{ align: "start" }} aria-label="이미지 {images.length}장">
		<Carousel.Content class="ms-0">
			{#each images as image (image.src)}
				<Carousel.Item class="ps-0">
					{@render frame(image)}
				</Carousel.Item>
			{/each}
		</Carousel.Content>
		<Carousel.Previous class="start-3 bg-background/80" />
		<Carousel.Next class="end-3 bg-background/80" />
		<TreadImageStatus total={images.length} />
	</Carousel.Root>
{:else if cover}
	{@render frame(cover)}
{/if}
