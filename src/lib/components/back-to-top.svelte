<script lang="ts">
	import { prefersReducedMotion } from "svelte/motion";
	import { fade } from "svelte/transition";
	import RiArrowUpLine from "remixicon-svelte/icons/arrow-up-line";
	import { Button } from "$lib/components/ui/button/index.js";

	let { targetId }: { targetId: string } = $props();

	let scrollY = $state(0);
	let innerHeight = $state(0);
	let visible = $derived(scrollY > innerHeight);

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: prefersReducedMotion.current ? "auto" : "smooth",
		});

		const target = document.getElementById(targetId);
		target?.focus({ preventScroll: true });
	}
</script>

<svelte:window bind:scrollY bind:innerHeight />

{#if visible}
	<div
		class="fixed z-50 right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))]"
		transition:fade={{ duration: prefersReducedMotion.current ? 0 : 160 }}
	>
		<Button
			type="button"
			variant="outline"
			size="icon-lg"
			class="bg-background/80 text-foreground size-10 rounded-full shadow-lg shadow-foreground/12 ring-1 ring-foreground/15 backdrop-blur hover:bg-background/90 hover:ring-foreground/30 dark:bg-background/80 dark:ring-foreground/25 dark:hover:bg-background/90 dark:hover:ring-foreground/40 [&_svg]:size-5"
			aria-label="맨 위로 이동"
			onclick={scrollToTop}
		>
			<RiArrowUpLine aria-hidden="true" />
		</Button>
	</div>
{/if}
