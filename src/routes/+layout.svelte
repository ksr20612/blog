<script lang="ts">
	import { onMount } from "svelte";
	import { ModeWatcher } from "mode-watcher";
	import favicon from "$lib/assets/favicon.ico";
	import SiteFooter from "$lib/components/site-footer.svelte";
	import SiteHeader from "$lib/components/site-header.svelte";
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
	<link rel="icon" href={favicon} />
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<ModeWatcher defaultMode="dark" />

<div class="flex min-h-svh flex-col">
	<SiteHeader />
	<main class="flex-1">
		{@render children()}
	</main>
	<SiteFooter />
</div>
