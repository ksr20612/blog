<script lang="ts">
	import PostList from "$lib/components/post-list.svelte";
	import { site } from "$lib/site";

	let { data } = $props();
</script>

<svelte:head>
	<title>Posts | {site.title}</title>
	<meta name="description" content="작성한 글을 날짜순으로 모아 둔 목록입니다." />
</svelte:head>

<section class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
	<div class="flex flex-col gap-2">
		<h1 class="text-2xl font-medium tracking-tight">Posts</h1>
	</div>
	<PostList posts={data.posts} tags={data.tags} />
</section>
