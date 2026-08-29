<script lang="ts">
	import type { Attachment } from "svelte/attachments";
	import type { TocItem } from "$lib/types";
	import { cn } from "$lib/utils";

	let { items }: { items: TocItem[] } = $props();

	/** sticky header(h-12) + 여유 — layout.css scroll-margin-top과 맞춤 */
	const TOP_OFFSET_PX = 72;
	/** 하단 이 거리 안이면 마지막 섹션을 active로 본다 */
	const BOTTOM_THRESHOLD_PX = 96;

	let activeId = $state<string | null>(null);

	const trackActive: Attachment = () => {
		const headings = items
			.map((item) => document.getElementById(item.id))
			.filter((element): element is HTMLElement => element !== null);

		const visibleIds = new Set<string>();
		let frame = 0;

		function updateActive() {
			const scrollBottom =
				window.scrollY + window.innerHeight >=
				document.documentElement.scrollHeight - BOTTOM_THRESHOLD_PX;

			if (scrollBottom) {
				activeId = items.at(-1)?.id ?? null;
				return;
			}

			let current: string | null = null;

			for (const item of items) {
				if (visibleIds.has(item.id)) {
					current = item.id;
				}
			}

			if (current !== null) {
				activeId = current;
				return;
			}

			// 관측 밴드에 헤딩이 없을 때: 오프셋 위에 있는 마지막 헤딩 유지
			for (const item of items) {
				const heading = document.getElementById(item.id);

				if (heading && heading.getBoundingClientRect().top <= TOP_OFFSET_PX) {
					current = item.id;
				}
			}

			activeId = current ?? items[0]?.id ?? null;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						visibleIds.add(entry.target.id);
					} else {
						visibleIds.delete(entry.target.id);
					}
				}

				updateActive();
			},
			{
				// 상단 헤더 영역 제외 + 하단 65%는 무시 → 읽기 위치 근처 헤딩만 후보
				rootMargin: `-${TOP_OFFSET_PX}px 0px -65% 0px`,
				threshold: 0,
			},
		);

		for (const heading of headings) {
			observer.observe(heading);
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
		updateActive();

		return () => {
			observer.disconnect();
			window.removeEventListener("scroll", onScroll);
			if (frame) {
				cancelAnimationFrame(frame);
			}
		};
	};
</script>

{#if items.length > 0}
	<nav aria-label="목차" {@attach trackActive}>
		<p class="text-muted-foreground mb-2 text-xs font-medium">목차</p>
		<ul class="border-border flex flex-col border-l">
			{#each items as item (item.id)}
				<li>
					<a
						href="#{item.id}"
						aria-current={activeId === item.id ? "location" : undefined}
						class={cn(
							"-ml-px block border-l py-1 text-sm leading-5 transition-colors",
							item.depth === 3 ? "pl-6" : "pl-3",
							activeId === item.id
								? "border-foreground text-foreground font-medium"
								: "text-muted-foreground hover:text-foreground border-transparent",
						)}
					>
						{item.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
