<script lang="ts">
	import { replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import type { Attachment } from "svelte/attachments";
	import type { Snippet } from "svelte";
	import { onMount, tick } from "svelte";
	import { fly } from "svelte/transition";
	import RiCloseLine from "remixicon-svelte/icons/close-line";
	import RiFileTextLine from "remixicon-svelte/icons/file-text-line";
	import RiSearchLine from "remixicon-svelte/icons/search-line";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import * as InputGroup from "$lib/components/ui/input-group/index.js";
	import { bodySnippet, postMatchesQuery, type SearchableListPost } from "$lib/search";
	import { cn } from "$lib/utils.js";
	import PostCard from "./post-card.svelte";

	let {
		posts,
		tags = [],
		heading,
		searchable = false,
	}: {
		posts: SearchableListPost[];
		tags?: string[];
		heading?: Snippet;
		searchable?: boolean;
	} = $props();

	const uid = $props.id();
	const hintId = `${uid}-tag-filter-hint`;
	const resultsId = `${uid}-post-results`;
	const searchId = `${uid}-search`;

	let query = $state("");
	let committedQuery = $state("");
	let selectedTag = $state<string | null>(null);
	let searchOpen = $state(false);
	let searchInput = $state<HTMLInputElement | null>(null);
	let searchRoot = $state<HTMLElement | null>(null);
	let stuck = $state(false);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);
	let filterAnnounced = $state(false);
	let normalizedQuery = $derived(query.trim());
	let hasFilter = $derived(Boolean(normalizedQuery || selectedTag));
	let visibleItems = $derived.by(() =>
		posts.flatMap((post) => {
			if (selectedTag && !post.tags.includes(selectedTag)) {
				return [];
			}

			if (!postMatchesQuery(post, query)) {
				return [];
			}

			return [{ post, snippet: bodySnippet(post, query) }];
		}),
	);
	let filterStatus = $derived.by(() => {
		const count = `글 ${visibleItems.length}개`;

		if (normalizedQuery && selectedTag) {
			return `${selectedTag} 태그와 ${normalizedQuery} 검색. ${count}`;
		}

		if (selectedTag) {
			return `${selectedTag} 태그로 필터링됨. ${count}`;
		}

		if (normalizedQuery) {
			return `${normalizedQuery} 검색. ${count}`;
		}

		return `필터 해제됨. ${count}`;
	});

	onMount(() => {
		if (!searchable) {
			return;
		}

		const params = page.url.searchParams;
		const nextQuery = params.get("q") ?? "";
		const nextTag = params.get("tag");
		query = nextQuery;
		committedQuery = nextQuery.trim();
		searchOpen = committedQuery.length > 0;
		selectedTag = nextTag && tags.includes(nextTag) ? nextTag : null;

		if (query.trim() || selectedTag) {
			filterAnnounced = true;
		}
	});

	function syncFilterUrl(nextQuery: string, nextTag: string | null) {
		const url = new URL(page.url);
		const trimmed = nextQuery.trim();

		if (trimmed) {
			url.searchParams.set("q", trimmed);
		} else {
			url.searchParams.delete("q");
		}

		if (nextTag) {
			url.searchParams.set("tag", nextTag);
		} else {
			url.searchParams.delete("tag");
		}

		if (url.search === page.url.search) {
			return;
		}

		replaceState(url, page.state);
	}

	function onQueryInput(event: Event) {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) {
			return;
		}

		query = target.value;
		filterAnnounced = true;
	}

	function commitSearch() {
		committedQuery = query.trim();
		filterAnnounced = true;
		syncFilterUrl(committedQuery, selectedTag);
	}

	function onQueryKeydown(event: KeyboardEvent) {
		if (event.key !== "Enter" || event.isComposing) {
			return;
		}

		event.preventDefault();
		commitSearch();
	}

	let openingSearch = false;

	async function openSearch(event: PointerEvent) {
		if (searchOpen || window.matchMedia("(min-width: 640px)").matches) {
			return;
		}

		event.preventDefault();
		
		openingSearch = true;
		searchOpen = true;
		await tick();
		searchInput?.focus();
		requestAnimationFrame(() => {
			openingSearch = false;
		});
	}

	function onSearchFocusOut(event: FocusEvent) {
		if (openingSearch) {
			return;
		}

		const next = event.relatedTarget;
		if (next instanceof Node && searchRoot?.contains(next)) {
			return;
		}

		if (document.activeElement === searchInput) {
			return;
		}

		if (!query.trim()) {
			searchOpen = false;
		}
	}

	function clearQuery() {
		query = "";
		committedQuery = "";
		filterAnnounced = true;
		syncFilterUrl("", selectedTag);
		searchInput?.focus();
	}

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
		if (searchable) {
			syncFilterUrl(committedQuery, selectedTag);
		}
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
		{#if heading || searchable}
			<div class="flex items-center gap-4">
				{#if heading}
					<div class="shrink-0">
						{@render heading()}
					</div>
				{/if}
				{#if searchable}
					<div
						bind:this={searchRoot}
						class="ms-auto flex min-w-0 flex-1 justify-end sm:max-w-56"
						onfocusout={onSearchFocusOut}
					>
						<div
							class={cn(
								"w-8 min-w-0 shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-full",
								searchOpen && "w-full",
							)}
						>
							<label for={searchId} class="sr-only">글 검색</label>
							<InputGroup.Root
								class="has-[[data-slot=input-group-control]:focus-visible]:border-primary! has-[[data-slot=input-group-control]:focus-visible]:ring-0!"
								onpointerdown={openSearch}
							>
								<InputGroup.Addon
									class="max-sm:pointer-events-none max-sm:absolute max-sm:top-1/2 max-sm:left-2 max-sm:z-10 max-sm:-translate-y-1/2 max-sm:p-0!"
								>
									<RiSearchLine />
								</InputGroup.Addon>
								<InputGroup.Input
									bind:ref={searchInput}
									id={searchId}
									type="search"
									placeholder="검색"
									autocomplete="off"
									enterkeyhint="search"
									aria-controls={resultsId}
									bind:value={query}
									class={cn(
										"[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none placeholder:transition-opacity placeholder:duration-200 sm:placeholder:opacity-100",
										searchOpen
											? "max-sm:pl-8! max-sm:placeholder:opacity-100 max-sm:placeholder:delay-150"
											: "max-sm:caret-transparent max-sm:pl-8! max-sm:placeholder:opacity-0",
									)}
									onfocus={() => {
										searchOpen = true;
									}}
									oninput={onQueryInput}
									onkeydown={onQueryKeydown}
								/>
								{#if query}
									<InputGroup.Addon align="inline-end">
										<InputGroup.Button
											size="icon-xs"
											aria-label="검색어 지우기"
											onclick={clearQuery}
										>
											<RiCloseLine />
										</InputGroup.Button>
									</InputGroup.Addon>
								{/if}
							</InputGroup.Root>
						</div>
					</div>
				{/if}
			</div>
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
	{#if visibleItems.length === 0}
		<Empty.Root class="border">
			<Empty.Header>
				<Empty.Media variant="icon">
					{#if normalizedQuery}
						<RiSearchLine />
					{:else}
						<RiFileTextLine />
					{/if}
				</Empty.Media>
				<Empty.Title>글이 없습니다.</Empty.Title>
				<Empty.Description>
					{#if normalizedQuery && selectedTag}
						선택한 태그와 검색어에 해당하는 글이 없어요.
					{:else if normalizedQuery}
						검색어와 일치하는 글이 없어요.
					{:else if selectedTag}
						선택한 태그에 해당하는 글이 없어요.
					{:else}
						공개된 글이 아직 없어요.
					{/if}
				</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{:else}
		{#if hasFilter}
			<p class="text-muted-foreground mb-4 text-sm" aria-hidden="true">{visibleItems.length}개의 글</p>
		{/if}
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each visibleItems as item (item.post.slug)}
				<li in:fly={{ y: 12, duration: 220 }}>
					<PostCard post={item.post} snippet={item.snippet} />
				</li>
			{/each}
		</ul>
	{/if}
</div>
