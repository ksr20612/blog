<script lang="ts">
	import { page } from "$app/state";
	import {
		absoluteUrl,
		canonicalUrl,
		jsonLdForPage,
		jsonLdScriptTag,
		ogImage,
		rssUrl,
		type SeoData,
	} from "$lib/seo";
	import { site } from "$lib/site";

	const seo = $derived.by((): SeoData => {
		const data = page.data.seo;

		return {
			title: data?.title ?? site.title,
			description: data?.description ?? site.description,
			ogType: data?.ogType ?? "website",
			headline: data?.headline,
			publishedTime: data?.publishedTime,
			tags: data?.tags,
			markdownPath: data?.markdownPath,
		};
	});

	const canonical = $derived(canonicalUrl(page.url.pathname));
	const ogTitle = $derived(seo.headline ?? seo.title);
	const markdownHref = $derived(seo.markdownPath ? absoluteUrl(seo.markdownPath) : undefined);
	const jsonLdTag = $derived(jsonLdScriptTag(jsonLdForPage(seo, page.url.pathname)));
	const rssHref = rssUrl();
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={canonical} />
	<link rel="alternate" type="application/rss+xml" title={site.title} href={rssHref} />
	{#if markdownHref}
		<link rel="alternate" type="text/markdown" title={ogTitle} href={markdownHref} />
	{/if}

	<meta property="og:type" content={seo.ogType} />
	<meta property="og:site_name" content={site.title} />
	<meta property="og:locale" content={site.locale} />
	<meta property="og:title" content={ogTitle} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage.url} />
	<meta property="og:image:alt" content={ogImage.alt} />
	<meta property="og:image:type" content={ogImage.type} />
	<meta property="og:image:width" content={String(ogImage.width)} />
	<meta property="og:image:height" content={String(ogImage.height)} />

	{#if seo.ogType === "article" && seo.publishedTime}
		<meta property="article:published_time" content={seo.publishedTime} />
		<meta property="article:author" content={site.author} />
		{#each seo.tags ?? [] as tag (tag)}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={ogTitle} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={ogImage.url} />
	<meta name="twitter:image:alt" content={ogImage.alt} />

	{@html jsonLdTag}
</svelte:head>
