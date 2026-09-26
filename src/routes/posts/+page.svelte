<script lang="ts">
	import BackToTop from "$lib/components/back-to-top.svelte";
	import PostList from "$lib/components/post-list.svelte";

	let { data } = $props();
</script>

<section class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12">
	<PostList posts={data.posts} tags={data.tags} searchable>
		{#snippet heading()}
			<h1 id="posts-heading" tabindex="-1" class="text-2xl font-medium tracking-tight">
				Posts
			</h1>
		{/snippet}
	</PostList>
</section>

<BackToTop targetId="posts-heading" />
