<script lang="ts">
	import { fly } from "svelte/transition";
	import RiFileTextLine from "remixicon-svelte/icons/file-text-line";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import type { PostMeta } from "$lib/types";
	import { cn } from "$lib/utils.js";
	import PostCard from "./post-card.svelte";

	let { posts, tags = [] }: { posts: PostMeta[]; tags?: string[] } = $props();

	let selectedTag = $state<string | null>(null);
	let visiblePosts = $derived.by(() => {
		if (!selectedTag) {
			return posts;
		}

		const tag = selectedTag;
		return posts.filter((post) => post.tags.includes(tag));
	});

	function toggleTag(tag: string) {
		selectedTag = selectedTag === tag ? null : tag;
	}
</script>

{#if tags.length > 0}
	<div class="flex flex-wrap gap-2">
		{#each tags as tag (tag)}
			<Badge
				variant="secondary"
				class={cn(
					"cursor-pointer",
					selectedTag === tag && "bg-foreground text-background hover:bg-foreground/90",
				)}
				onclick={() => toggleTag(tag)}
			>
				{tag}
			</Badge>
		{/each}
	</div>
{/if}

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
