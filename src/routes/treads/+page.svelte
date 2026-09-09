<script lang="ts">
	import RiChat3Line from "remixicon-svelte/icons/chat-3-line";
	import TreadCard from "$lib/components/tread-card.svelte";
	import TreadThread from "$lib/components/tread-thread.svelte";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { site } from "$lib/site";

	let { data } = $props();
</script>

<svelte:head>
	<title>Treads | {site.title}</title>
	<meta name="description" content="짧게 남긴 글과 이미지를 모아 둔 타임라인입니다." />
</svelte:head>

<section class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
	<div class="flex flex-col gap-2">
		<h1 class="text-2xl font-medium tracking-tight">Treads</h1>
	</div>

	{#if data.treads.length === 0}
		<Empty.Root class="border">
			<Empty.Header>
				<Empty.Media variant="icon">
					<RiChat3Line />
				</Empty.Media>
				<Empty.Title>글이 없습니다.</Empty.Title>
			</Empty.Header>
		</Empty.Root>
	{:else}
		<TreadThread count={data.treads.length}>
			{#each data.treads as tread (tread.slug)}
				<li class="tread-item relative z-10 hover:z-20">
					<TreadCard {tread} />
				</li>
			{/each}
		</TreadThread>
	{/if}
</section>
