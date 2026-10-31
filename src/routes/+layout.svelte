<script lang="ts">
	import { onMount } from "svelte";
	import { ModeWatcher } from "mode-watcher";
	import favicon from "$lib/assets/favicon.ico";
	import SeoHead from "$lib/components/seo-head.svelte";
	import SiteFooter from "$lib/components/site-footer.svelte";
	import SiteHeader from "$lib/components/site-header.svelte";
	import { fontPreloads } from "$lib/font-preloads";
	import { site } from "$lib/site";
	import "./layout.css";

	let { children } = $props();

	onMount(async () => {
		if (!import.meta.env.PROD) return;

		const Clarity = (await import("@microsoft/clarity")).default;
		Clarity.init(site.clarityProjectId);
	});
</script>

<svelte:head>
	{#each fontPreloads as href (href)}
		<link rel="preload" as="font" type="font/woff2" {href} crossorigin="anonymous" />
	{/each}
	<link rel="icon" href={favicon} />
</svelte:head>

<SeoHead />

<ModeWatcher defaultMode="dark" />

<div class="relative flex min-h-svh flex-col">
	<a href="#main-content" class="skip-link">본문으로 건너뛰기</a>
	<SiteHeader />
	<main id="main-content" class="flex-1" tabindex="-1">
		{@render children()}
	</main>
	<SiteFooter />
</div>
