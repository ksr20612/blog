<script lang="ts">
	import type { Snippet } from "svelte";

	let { children, count }: { children: Snippet; count: number } = $props();

	type Point = { x: number; y: number };

	let wrap = $state<HTMLDivElement | null>(null);
	let points = $state<Point[]>([]);
	let wrapWidth = $state(0);

	const path = $derived(threadPath(points, wrapWidth));

	$effect(() => {
		void count;
		const node = wrap;
		if (!node) {
			return;
		}

		const list = node.querySelector("ul");
		if (!list) {
			return;
		}

		const frame = node;
		const items = list;

		function measure() {
			const origin = frame.getBoundingClientRect();
			const next = [...items.children].map((child) => {
				const rect = child.getBoundingClientRect();
				return {
					x: rect.left - origin.left + rect.width / 2,
					y: rect.top - origin.top + rect.height / 2,
				};
			});

			if (next[0]) {
				wrapWidth = frame.clientWidth;
				points = [{ x: next[0].x, y: Math.max(0, next[0].y - 32) }, ...next];
				return;
			}

			wrapWidth = frame.clientWidth;
			points = next;
		}

		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(frame);
		observer.observe(items);
		window.addEventListener("resize", measure);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", measure);
		};
	});

	function threadPath(items: Point[], width: number) {
		if (items.length === 0) {
			return "";
		}

		if (items.length === 1 && items[0]) {
			return `M ${items[0].x} ${items[0].y}`;
		}

		const first = items[0];
		if (!first) {
			return "";
		}

		let d = `M ${first.x} ${first.y}`;
		for (let i = 1; i < items.length; i += 1) {
			const from = items[i - 1];
			const to = items[i];
			if (!from || !to) {
				continue;
			}

			const dx = to.x - from.x;
			const dy = to.y - from.y;
			const isRowWrap = Math.abs(dy) > 56 && Math.abs(dy) > Math.abs(dx) * 1.2;

			if (isRowWrap) {
				const dir = from.x >= width / 2 ? 1 : -1;
				const distToEdge = dir === 1 ? width - from.x : from.x;
				const bulge = distToEdge + 36;
				const outerX = from.x + dir * bulge;
				const midY = (from.y + to.y) / 2;
				d += ` C ${outerX} ${from.y} ${outerX} ${midY} ${outerX} ${midY}`;
				d += ` C ${outerX} ${to.y} ${to.x} ${to.y} ${to.x} ${to.y}`;
				continue;
			}

			const sag = Math.min(22, Math.hypot(dx, dy) * 0.16);
			const c1x = from.x + dx * 0.35;
			const c2x = from.x + dx * 0.65;
			d += ` C ${c1x} ${from.y + sag} ${c2x} ${to.y + sag} ${to.x} ${to.y}`;
		}

		return d;
	}
</script>

<div bind:this={wrap} class="relative overflow-visible">
	{#if path}
		<svg
			class="tread-thread pointer-events-none absolute inset-0 z-0 overflow-visible text-muted-foreground/40"
			aria-hidden="true"
		>
			<path class="tread-thread-path" d={path} pathLength="1" />
			{#each points.slice(1) as point, index (`${point.x}-${point.y}-${index}`)}
				<circle class="tread-thread-knot" cx={point.x} cy={point.y} r="3.5" />
			{/each}
		</svg>
	{/if}

	<ul class="tread-list relative z-10 grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{@render children()}
	</ul>
</div>

<style>
	.tread-list {
		grid-auto-flow: dense;
	}

	@media (min-width: 40rem) {
		.tread-list :global(.tread-item:nth-child(4n + 1)),
		.tread-list :global(.tread-item:nth-child(4n + 4)) {
			grid-column: 1;
		}

		.tread-list :global(.tread-item:nth-child(4n + 2)),
		.tread-list :global(.tread-item:nth-child(4n + 3)) {
			grid-column: 2;
		}
	}

	@media (min-width: 64rem) {
		.tread-list :global(.tread-item:nth-child(4n + 1)),
		.tread-list :global(.tread-item:nth-child(4n + 2)),
		.tread-list :global(.tread-item:nth-child(4n + 3)),
		.tread-list :global(.tread-item:nth-child(4n + 4)) {
			grid-column: auto;
		}

		.tread-list :global(.tread-item:nth-child(6n + 1)),
		.tread-list :global(.tread-item:nth-child(6n + 6)) {
			grid-column: 1;
		}

		.tread-list :global(.tread-item:nth-child(6n + 2)),
		.tread-list :global(.tread-item:nth-child(6n + 5)) {
			grid-column: 2;
		}

		.tread-list :global(.tread-item:nth-child(6n + 3)),
		.tread-list :global(.tread-item:nth-child(6n + 4)) {
			grid-column: 3;
		}
	}

	.tread-thread-path {
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.25;
		stroke-dasharray: 1;
		stroke-dashoffset: 0;
	}

	.tread-thread-knot {
		fill: var(--background);
		stroke: currentColor;
		stroke-width: 1.25;
	}

	@supports (animation-timeline: view()) {
		@media (prefers-reduced-motion: no-preference) {
			.tread-thread-path {
				animation: tread-thread-draw linear both;
				animation-range: cover 0% cover 75%;
				animation-timeline: view();
			}

			:global(.tread-item) {
				animation: tread-card-enter linear both;
				animation-range: entry 0% entry 45%;
				animation-timeline: view();
			}
		}
	}

	@keyframes tread-thread-draw {
		from {
			stroke-dashoffset: 1;
		}

		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes tread-card-enter {
		from {
			opacity: 0;
			transform: translateY(18px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
