<script lang="ts">
	import PostList from "$lib/components/post-list.svelte";

	let { data } = $props();
</script>

<section class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
	<PostList posts={data.posts} tags={data.tags}>
		{#snippet heading()}
			<h1 class="text-2xl font-medium tracking-tight">Posts</h1>
		{/snippet}
	</PostList>
</section>
