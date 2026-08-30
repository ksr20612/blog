<script lang="ts">
	import { resolve } from "$app/paths";
	import type { AdjacentPost } from "$lib/types";
	import RiArrowDropLeftLine from "remixicon-svelte/icons/arrow-drop-left-line";
	import RiArrowDropRightLine from "remixicon-svelte/icons/arrow-drop-right-line";

	let {
		previous,
		next,
	}: {
		previous: AdjacentPost | null;
		next: AdjacentPost | null;
	} = $props();
</script>

{#snippet adjacentLink(post: AdjacentPost, label: string, side: "left" | "right")}
	<a
		href={resolve("/posts/[slug]", { slug: post.slug })}
		class={[
			"bg-muted hover:border-foreground/20 flex min-w-0 flex-col gap-2 overflow-hidden rounded-lg border border-border px-4 py-4 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
			side === "right" ? "sm:items-end sm:text-right" : "items-start",
		]}
	>
		<span
			class="bg-background text-muted-foreground inline-flex w-fit items-center gap-0.5 rounded-[calc(var(--radius)*0.8)] border border-border px-2 py-1 text-xs leading-none"
		>
			{#if side === "left"}
				<RiArrowDropLeftLine class="size-3.5 shrink-0" aria-hidden="true" />
			{/if}
			{label}
			{#if side === "right"}
				<RiArrowDropRightLine class="size-3.5 shrink-0" aria-hidden="true" />
			{/if}
		</span>
		<span class="w-full min-w-0 line-clamp-2 font-medium">{post.title}</span>
	</a>
{/snippet}

{#snippet adjacentSlot(post: AdjacentPost | null, label: string, side: "left" | "right")}
	{#if post}
		{@render adjacentLink(post, label, side)}
	{:else}
		<div class="min-w-0" aria-hidden="true"></div>
	{/if}
{/snippet}

{#if previous || next}
	<nav aria-label="다른 글" class="grid grid-cols-2 gap-6">
		{@render adjacentSlot(previous, "이전 글", "left")}
		{@render adjacentSlot(next, "다음 글", "right")}
	</nav>
{/if}
