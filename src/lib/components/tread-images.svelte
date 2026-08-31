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
</script>

{#if images.length === 1 && images[0]}
	<div class="overflow-hidden rounded-xl bg-muted">
		<img
			src={srcFor(images[0])}
			alt={images[0].alt}
			class="mx-auto max-h-[28rem] w-full object-contain"
			loading="lazy"
			decoding="async"
		/>
	</div>
{:else if images.length > 1}
	<Carousel.Root opts={{ loop: false }} class="w-full" aria-label="이미지 슬라이드">
		<div class="relative">
			<Carousel.Content class="-ms-0">
				{#each images as image, index (`${image.src}-${index}`)}
					<Carousel.Item class="ps-0">
						<div
							class="flex h-80 items-center justify-center overflow-hidden rounded-xl bg-muted sm:h-[28rem]"
						>
							<img
								src={srcFor(image)}
								alt={image.alt}
								class="max-h-full max-w-full object-contain"
								loading="lazy"
								decoding="async"
							/>
						</div>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Previous class="start-3 bg-background/80" aria-label="이전 이미지" />
			<Carousel.Next class="end-3 bg-background/80" aria-label="다음 이미지" />
		</div>
		<TreadImageStatus total={images.length} />
	</Carousel.Root>
{/if}
