<script lang="ts">
	import type { Attachment } from "svelte/attachments";
	import type { Snippet } from "svelte";
	import { fly } from "svelte/transition";
	import RiFileTextLine from "remixicon-svelte/icons/file-text-line";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import type { PostMeta } from "$lib/types";
	import { cn } from "$lib/utils.js";
	import PostCard from "./post-card.svelte";

	let {
		posts,
		tags = [],
		heading,
	}: {
		posts: PostMeta[];
		tags?: string[];
		heading?: Snippet;
	} = $props();

	const uid = $props.id();
	const hintId = `${uid}-tag-filter-hint`;
	const resultsId = `${uid}-post-results`;

	let selectedTag = $state<string | null>(null);
	let stuck = $state(false);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);
	let filterAnnounced = $state(false);
	let visiblePosts = $derived.by(() => {
		if (!selectedTag) {
			return posts;
		}

		const tag = selectedTag;
		return posts.filter((post) => post.tags.includes(tag));
	});
	let filterStatus = $derived(
		selectedTag
			? `${selectedTag} 태그로 필터링됨. 글 ${visiblePosts.length}개`
			: `필터 해제됨. 글 ${visiblePosts.length}개`,
	);

	const observeStuck: Attachment = (element) => {
		const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 49;
		// 경계의 1px는 intersecting으로 잡힘
		const offset = Math.ceil(headerHeight) + 1;
		const observer = new IntersectionObserver(
			([entry]) => {
				stuck = !entry.isIntersecting;
			},
			{ rootMargin: `-${offset}px 0px 0px 0px`, threshold: 0 },
		);

		observer.observe(element);

		return () => observer.disconnect();
	};

	const observeTagOverflow: Attachment = (element) => {
		const scroller = element as HTMLElement;
		const update = () => {
			canScrollLeft = scroller.scrollLeft > 1;
			canScrollRight = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1;
		};

		const resizeObserver = new ResizeObserver(update);
		resizeObserver.observe(scroller);
		scroller.addEventListener("scroll", update, { passive: true });

		return () => {
			resizeObserver.disconnect();
			scroller.removeEventListener("scroll", update);
		};
	};

	function toggleTag(tag: string, chip: HTMLElement) {
		selectedTag = selectedTag === tag ? null : tag;
		filterAnnounced = true;
		chip.scrollIntoView({ inline: "nearest", block: "nearest" });
	}
</script>

{#if heading || tags.length > 0}
	<div
		class={cn(
			"sticky top-[calc(3rem+1px)] z-30 -mx-4 flex flex-col gap-4 border-b bg-background/80 px-4 py-3 backdrop-blur",
			!stuck && "border-transparent",
		)}
	>
		<div
			class="pointer-events-none absolute -top-px left-0 h-px w-px"
			aria-hidden="true"
			{@attach observeStuck}
		></div>
		{#if heading}
			{@render heading()}
		{/if}
		{#if tags.length > 0}
			<div role="group" aria-label="태그 필터" aria-describedby={hintId}>
				<p id={hintId} class="sr-only">
					태그를 선택하면 해당 글만 보입니다. 같은 태그를 다시 누르면 해제됩니다.
				</p>
				<div
					class={cn(
						"-mx-4 overflow-x-auto px-4 touch-pan-x overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
						canScrollLeft &&
							canScrollRight &&
							"[mask-image:linear-gradient(to_right,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]",
						canScrollLeft &&
							!canScrollRight &&
							"[mask-image:linear-gradient(to_right,transparent,black_1.25rem)]",
						!canScrollLeft &&
							canScrollRight &&
							"[mask-image:linear-gradient(to_right,black_calc(100%-1.25rem),transparent)]",
					)}
					{@attach observeTagOverflow}
				>
					<div class="flex w-max gap-2">
						{#each tags as tag (tag)}
							{@const selected = selectedTag === tag}
							<Badge
								variant={selected ? "default" : "secondary"}
								role="button"
								tabindex={0}
								aria-pressed={selected}
								aria-controls={resultsId}
								class={cn(
									"cursor-pointer",
									selected
										? "hover:bg-primary/80 active:bg-primary/80"
										: "hover:bg-selection active:bg-selection",
								)}
								onclick={(event) => toggleTag(tag, event.currentTarget)}
								onkeydown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										toggleTag(tag, event.currentTarget);
									}
								}}
							>
								{tag}
							</Badge>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

<div id={resultsId}>
	<div class="sr-only" role="status" aria-atomic="true">
		{filterAnnounced ? filterStatus : ""}
	</div>
	{#if visiblePosts.length === 0}
		<Empty.Root class="border">
			<Empty.Header>
				<Empty.Media variant="icon">
					<RiFileTextLine />
				</Empty.Media>
				<Empty.Title>글이 없습니다.</Empty.Title>
				<Empty.Description>
					{#if selectedTag}
						선택한 태그에 해당하는 글이 없어요.
					{:else}
						공개된 글이 아직 없어요.
					{/if}
				</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each visiblePosts as post (post.slug)}
				<li in:fly={{ y: 12, duration: 220 }}>
					<PostCard {post} />
				</li>
			{/each}
		</ul>
	{/if}
</div>
