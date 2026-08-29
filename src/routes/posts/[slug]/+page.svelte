<script lang="ts">
	import { resolve } from "$app/paths";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import MarkdownBody from "$lib/components/markdown-body.svelte";
	import PostToc from "$lib/components/post-toc.svelte";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import { formatDate } from "$lib/format";
	import { site } from "$lib/site";

	let { data } = $props();
	let post = $derived(data.post);
</script>

<svelte:head>
	<title>{post.title} · {site.title}</title>
	<meta name="description" content={post.description} />
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-16">
	<div class="relative">
		<article class="flex flex-col gap-8">
			<header class="flex flex-col gap-4">
				<p class="text-muted-foreground text-sm">
					<a href={resolve("/posts")} class="hover:text-foreground underline-offset-4 hover:underline">Posts</a>
					<span aria-hidden="true">/</span>
					<time datetime={post.date}>{formatDate(post.date)}</time>
				</p>
				<h1 class="text-3xl font-medium tracking-tight sm:text-4xl">{post.title}</h1>
				{#if post.description}
					<p class="text-muted-foreground text-lg leading-7">{post.description}</p>
				{/if}
				{#if post.tags.length > 0}
					<div class="flex flex-wrap gap-1.5">
						{#each post.tags as tag (tag)}
							<Badge variant="secondary">{tag}</Badge>
						{/each}
					</div>
				{/if}
			</header>

			<Separator />

			<MarkdownBody html={post.html} />
		</article>

		{#if post.toc.length > 0}
			<aside class="absolute top-0 left-full ml-8 hidden h-full w-52 toc:block">
				<div class="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
					{#key post.slug}
						<PostToc items={post.toc} />
					{/key}
				</div>
			</aside>
		{/if}
	</div>
</div>
