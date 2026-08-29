<script lang="ts">
	import { resolve } from "$app/paths";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { formatDate } from "$lib/format";
	import type { PostMeta } from "$lib/types";

	let { post }: { post: PostMeta } = $props();
</script>

<a href={resolve("/posts/[slug]", { slug: post.slug })} class="block h-full">
	<Card.Root class="h-full text-base ring-[#efeeeb] transition-all hover:ring-foreground/20">
		<Card.Header class="gap-2.5">
			<p class="text-muted-foreground text-xs">{formatDate(post.date)}</p>
			<Card.Title class="text-foreground font-semibold leading-relaxed">{post.title}</Card.Title>
			<Card.Description class="text-foreground/75 leading-relaxed">{post.description}</Card.Description>
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
</a>
