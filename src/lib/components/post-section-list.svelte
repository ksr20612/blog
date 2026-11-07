<script lang="ts">
	import { resolve } from "$app/paths";
	import type { PostMeta } from "$lib/types";

	let { posts }: { posts: PostMeta[] } = $props();
</script>

<ul class="flex flex-col divide-y">
	{#each posts as post (post.slug)}
		<li>
			<a
				href={resolve("/posts/[slug]", { slug: post.slug })}
				class="group flex items-baseline gap-4 rounded-sm py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
			>
				<time
					datetime={post.date}
					class="w-[10ch] shrink-0 text-xs whitespace-nowrap tabular-nums text-muted-foreground"
				>
					{post.date}
				</time>
				<span
					class="min-w-0 text-sm font-medium transition-colors group-hover:text-primary group-focus-visible:text-primary"
				>
					{post.title}
				</span>
			</a>
		</li>
	{/each}
</ul>
