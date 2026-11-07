<script lang="ts">
	import { resolve } from "$app/paths";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { formatDate } from "$lib/format";
	import type { SearchSnippet } from "$lib/search";
	import type { PostMeta } from "$lib/types";

	let {
		post,
		snippet = null,
		headingLevel = 3,
	}: {
		post: PostMeta;
		snippet?: SearchSnippet | null;
		headingLevel?: 2 | 3;
	} = $props();
</script>

<Card.Root
	class="relative h-full text-base ring-[#efeeeb] transition-all hover:ring-foreground/20 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
>
	<Card.Header class="gap-2.5">
		<time datetime={post.date} class="text-muted-foreground text-xs">{formatDate(post.date)}</time>
		<Card.Title class="text-foreground font-semibold leading-relaxed">
			<svelte:element this={`h${headingLevel}`}>
				<a
					href={resolve("/posts/[slug]", { slug: post.slug })}
					class="outline-none after:absolute after:inset-0"
				>
					{post.title}
				</a>
			</svelte:element>
		</Card.Title>
		<Card.Description class="text-foreground/75 leading-relaxed">{post.description}</Card.Description>
		{#if snippet}
			<p class="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
				{snippet.before}<mark class="bg-selection text-foreground rounded-sm">{snippet.match}</mark>{snippet.after}
			</p>
		{/if}
	</Card.Header>
	{#if post.tags.length > 0}
		<Card.Content>
			<div class="flex flex-wrap gap-1.5">
				{#each post.tags as tag (tag)}
					<Badge variant="secondary">{tag}</Badge>
				{/each}
			</div>
		</Card.Content>
	{/if}
</Card.Root>
