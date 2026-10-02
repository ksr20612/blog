<script lang="ts">
	import type { Attachment } from "svelte/attachments";
	import { prefersReducedMotion } from "svelte/motion";
	import type { TocItem } from "$lib/types";
	import { cn } from "$lib/utils";

	let { items }: { items: TocItem[] } = $props();

	/** sticky header(h-12) + 여유 — layout.css scroll-margin-top과 맞춤 */
	const TOP_OFFSET_PX = 72;
	/** 하단 이 거리 안이면 마지막 섹션을 active로 본다 */
	const BOTTOM_THRESHOLD_PX = 96;
	const MIN_SCROLL_MS = 400;
	const MAX_SCROLL_MS = 700;
	const MS_PER_PX = 0.45;

	let activeId = $state<string | null>(null);
	let markerTop = $state(0);
	let markerHeight = $state(0);
	let markerReady = $state(false);
	let headingScrollFrame = 0;
	let headingScrollGeneration = 0;

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
				if (Math.abs(currentSlope) < 1e-6) {
					break;
				}
				const error = sample(t, x1, x2) - x;
				if (Math.abs(error) < 1e-6) {
					return t;
				}
				t -= error / currentSlope;
			}
			return t;
		};

		return (x: number) => sample(solve(x), y1, y2);
	}

	const headingScrollEase = cubicBezier(0.22, 1, 0.36, 1);

	function stopHeadingScroll() {
		headingScrollGeneration += 1;
		if (headingScrollFrame) {
			cancelAnimationFrame(headingScrollFrame);
			headingScrollFrame = 0;
		}
		window.removeEventListener("wheel", stopHeadingScroll);
		window.removeEventListener("touchmove", stopHeadingScroll);
		window.removeEventListener("keydown", stopHeadingScrollOnKey);
	}

	function stopHeadingScrollOnKey(event: KeyboardEvent) {
		if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "PageUp" || event.key === "PageDown" || event.key === "Home" || event.key === "End" || event.key === " ") {
			stopHeadingScroll();
		}
	}

	const trackActive: Attachment = (nav) => {
		let frame = 0;

		function updateActive() {
			const list = nav.querySelector("ul");
			if (!list) {
				return;
			}

			const listTop = list.getBoundingClientRect().top;
			const nodes = items.flatMap((item) => {
				const heading = document.getElementById(item.id);
				const link = nav.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(item.id)}"]`);
				if (!heading || !link) {
					return [];
				}

				const linkRect = link.getBoundingClientRect();

				return [
					{
						id: item.id,
						headingTop: heading.getBoundingClientRect().top + window.scrollY,
						linkTop: linkRect.top - listTop,
						linkHeight: linkRect.height,
					},
				];
			});

			if (nodes.length === 0) {
				return;
			}

			const atBottom =
				window.scrollY + window.innerHeight >=
				document.documentElement.scrollHeight - BOTTOM_THRESHOLD_PX;
			const reading = window.scrollY + TOP_OFFSET_PX;
			let index = 0;

			for (let i = 0; i < nodes.length; i += 1) {
				if (nodes[i].headingTop <= reading) {
					index = i;
				}
			}

			if (atBottom) {
				index = nodes.length - 1;
			}

			const current = nodes[index];
			markerTop = current.linkTop;
			markerHeight = current.linkHeight;
			activeId = current.id;
		}

		function onScroll() {
			if (frame) {
				return;
			}

			frame = requestAnimationFrame(() => {
				frame = 0;
				updateActive();
			});
		}

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll, { passive: true });
		updateActive();
		requestAnimationFrame(() => {
			markerReady = true;
			updateActive();
		});

		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			stopHeadingScroll();
			if (frame) {
				cancelAnimationFrame(frame);
			}
		};
	};

	function scrollToHeading(event: MouseEvent, id: string) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
			return;
		}

		const heading = document.getElementById(id);
		if (!heading) {
			return;
		}

		event.preventDefault();
		stopHeadingScroll();

		const margin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
		const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
		const top = Math.min(
			Math.max(0, heading.getBoundingClientRect().top + window.scrollY - margin),
			maxScroll,
		);
		const start = window.scrollY;
		const distance = top - start;
		history.pushState(history.state, "", `#${id}`);

		if (prefersReducedMotion.current || Math.abs(distance) < 1) {
			window.scrollTo({ top, behavior: "auto" });
			return;
		}

		const duration = Math.min(MAX_SCROLL_MS, Math.max(MIN_SCROLL_MS, Math.abs(distance) * MS_PER_PX));
		const started = performance.now();
		const generation = headingScrollGeneration;

		window.addEventListener("wheel", stopHeadingScroll, { passive: true });
		window.addEventListener("touchmove", stopHeadingScroll, { passive: true });
		window.addEventListener("keydown", stopHeadingScrollOnKey);

		const step = (now: number) => {
			if (generation !== headingScrollGeneration) {
				return;
			}

			const progress = Math.min(1, (now - started) / duration);
			window.scrollTo({
				top: start + distance * headingScrollEase(progress),
				behavior: "auto",
			});

			if (progress < 1) {
				headingScrollFrame = requestAnimationFrame(step);
				return;
			}

			headingScrollFrame = 0;
			window.removeEventListener("wheel", stopHeadingScroll);
			window.removeEventListener("touchmove", stopHeadingScroll);
			window.removeEventListener("keydown", stopHeadingScrollOnKey);
		};

		headingScrollFrame = requestAnimationFrame(step);
	}
</script>

{#if items.length > 0}
	<nav aria-label="목차" {@attach trackActive}>
		<p class="text-muted-foreground mb-2 text-xs font-medium">목차</p>
		<ul class="border-border relative flex flex-col border-l">
			{#if markerHeight > 0}
				<span
					class={cn(
						"bg-primary pointer-events-none absolute top-0 -left-px w-px",
						markerReady &&
							"transition-[height,transform] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
					)}
					style:height="{markerHeight}px"
					style:transform="translateY({markerTop}px)"
					aria-hidden="true"
				></span>
			{/if}
			{#each items as item (item.id)}
				<li>
					<a
						href="#{item.id}"
						data-toc-id={item.id}
						aria-current={activeId === item.id ? "location" : undefined}
						onclick={(event) => scrollToHeading(event, item.id)}
						class={cn(
							"block py-1 text-sm leading-5 transition-colors",
							item.depth === 3 ? "pl-6" : "pl-3",
							activeId === item.id
								? "text-foreground font-medium"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{item.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
