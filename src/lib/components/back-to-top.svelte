<script lang="ts" module>
	export const floatingActionButtonClass =
		"bg-background/80 text-foreground size-10 rounded-full shadow-lg shadow-foreground/12 ring-1 ring-foreground/15 backdrop-blur hover:bg-background/90 hover:ring-foreground/30 dark:bg-background/80 dark:ring-foreground/25 dark:hover:bg-background/90 dark:hover:ring-foreground/40 [&_svg]:size-5";
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import { prefersReducedMotion } from "svelte/motion";
	import { fly } from "svelte/transition";
	import RiArrowUpLine from "remixicon-svelte/icons/arrow-up-line";
	import { Button } from "$lib/components/ui/button/index.js";

	let { targetId, children }: { targetId: string; children?: Snippet } = $props();

	let scrollY = $state(0);
	let innerHeight = $state(0);
	let visible = $derived(innerHeight > 0 && scrollY > innerHeight * 0.3);

	function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
		const sample = (t: number, a1: number, a2: number) => {
			const a = 1 - 3 * a2 + 3 * a1;
			const b = 3 * a2 - 6 * a1;
			return ((a * t + b) * t + 3 * a1) * t;
		};
		const slope = (t: number) => {
			const a = 3 * (1 - 3 * x2 + 3 * x1);
			const b = 2 * (3 * x2 - 6 * x1);
			return (a * t + b) * t + 3 * x1;
		};
		const solve = (x: number) => {
			let t = x;
			for (let i = 0; i < 8; i += 1) {
				const currentSlope = slope(t);
				if (Math.abs(currentSlope) < 1e-6) break;
				const error = sample(t, x1, x2) - x;
				if (Math.abs(error) < 1e-6) return t;
				t -= error / currentSlope;
			}
			return t;
		};

		return (x: number) => sample(solve(x), y1, y2);
	}

	const listRevealEasing = cubicBezier(0.22, 1, 0.36, 1);

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

<div
	class="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-4xl flex-col items-end gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
>
	{#if visible}
		<div
			class="pointer-events-auto"
			transition:fly={children
				? { y: 8, duration: prefersReducedMotion.current ? 0 : 160 }
				: { y: 16, duration: prefersReducedMotion.current ? 0 : 320, easing: listRevealEasing }}
		>
			<Button
				type="button"
				variant="outline"
				size="icon-lg"
				class={floatingActionButtonClass}
				aria-label="맨 위로 이동"
				onclick={scrollToTop}
			>
				<RiArrowUpLine aria-hidden="true" />
			</Button>
		</div>
	{/if}
	{#if children}
		<div class="pointer-events-auto">
			{@render children()}
		</div>
	{/if}
</div>
