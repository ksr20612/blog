<script lang="ts">
	import { resolve } from "$app/paths";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import PostList from "$lib/components/post-list.svelte";
	import { site } from "$lib/site";

	let { data } = $props();
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<section class="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
	<div class="flex flex-col gap-4">
		<p class="text-muted-foreground text-sm">{site.name}</p>
		<h1 class="text-2xl font-medium tracking-tight sm:text-3xl">
			사람을 적는 기록
		</h1>
		<p class="text-muted-foreground text-base leading-7">
			{site.description}
		</p>
		<div>
			<Button href={resolve("/posts")}>글 전체 보기</Button>
		</div>
	</div>

	<Separator />

	<div class="flex flex-col gap-6">
		<div class="flex items-end justify-between gap-4">
			<h2 class="text-xl font-medium tracking-tight">최근 글</h2>
			<Button variant="ghost" href={resolve("/posts")}>전체 보기</Button>
		</div>
		<PostList posts={data.posts} />
	</div>
</section>
