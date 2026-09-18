<script lang="ts">
	import PostList from "$lib/components/post-list.svelte";

	let { data } = $props();
</script>

<section class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
	<div class="flex flex-col gap-2">
		<h1 class="text-2xl font-medium tracking-tight">Posts</h1>
	</div>
	<PostList posts={data.posts} tags={data.tags} />
</section>
