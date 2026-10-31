<script lang="ts">
	import { resolve } from "$app/paths";
	import { formatDate } from "$lib/format";
	import type { PostMeta } from "$lib/types";

	let { posts }: { posts: PostMeta[] } = $props();
	const headingId = $props.id();
</script>

{#if posts.length >= 2}
	<nav aria-labelledby={headingId} class="flex flex-col gap-4">
		<h2 id={headingId} class="font-serif text-xl font-medium tracking-tight">
			같이 보면 좋은 글<span class="text-primary">.</span>
		</h2>
		<ul
			class={[
				"grid gap-4",
				posts.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
			]}
		>
			{#each posts as post (post.slug)}
				<li>
					<a
						href={resolve("/posts/[slug]", { slug: post.slug })}
						class="bg-muted hover:border-foreground/20 flex h-full min-w-0 flex-col gap-2 rounded-lg border border-border px-4 py-4 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						<time
							datetime={post.date}
							class="text-muted-foreground text-xs tabular-nums"
						>
							{formatDate(post.date)}
						</time>
						<span class="line-clamp-2 font-medium">{post.title}</span>
						{#if post.description}
							<span class="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
								{post.description}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
