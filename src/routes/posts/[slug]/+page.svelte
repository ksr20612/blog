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

<div class="mx-auto max-w-4xl px-4 py-12">
	<div class="relative">
		<article class="flex flex-col gap-6">
			<header class="flex flex-col gap-4">
				<p class="text-muted-foreground text-sm">
					<a href={resolve("/posts")} class="hover:text-foreground underline-offset-4 hover:underline">Posts</a>
					<span aria-hidden="true">/</span>
					<time datetime={post.date}>{formatDate(post.date)}</time>
				</p>
				<h1 class="text-2xl font-medium tracking-tight sm:text-3xl">{post.title}</h1>
				{#if post.description}
					<p class="text-muted-foreground text-base leading-7">{post.description}</p>
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
				<div class="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto">
					{#key post.slug}
						<PostToc items={post.toc} />
					{/key}
				</div>
			</aside>
		{/if}
	</div>
</div>
