<script lang="ts">
	import { resolve } from "$app/paths";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import MarkdownBody from "$lib/components/markdown-body.svelte";
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

<article class="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-16">
	<header class="flex flex-col gap-4">
		<p class="text-muted-foreground text-sm">
			<a href={resolve("/posts")} class="hover:text-foreground underline-offset-4 hover:underline">글</a>
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
