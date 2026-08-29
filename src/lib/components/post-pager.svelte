<script lang="ts">
	import { resolve } from "$app/paths";
	import type { AdjacentPost } from "$lib/types";

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
			"bg-muted hover:border-foreground/20 flex flex-col gap-2 rounded-lg border border-border px-4 py-4 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
			side === "right" ? "sm:items-end sm:text-right" : "items-start",
		]}
	>
		<span
			class="bg-background text-muted-foreground w-fit rounded-[calc(var(--radius)*0.8)] border border-border px-2 py-1 text-xs leading-none"
		>
			{label}
		</span>
		<span class="font-medium text-pretty">{post.title}</span>
	</a>
{/snippet}

{#if previous || next}
	<nav
		aria-label="다른 글"
		class={["grid gap-3", previous && next && "sm:grid-cols-2"]}
	>
		{#if previous}
			{@render adjacentLink(previous, "이전 글", "left")}
		{/if}
		{#if next}
			{@render adjacentLink(next, "다음 글", "right")}
		{/if}
	</nav>
{/if}
