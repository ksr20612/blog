<script lang="ts">
	import { resolve } from "$app/paths";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import PostList from "$lib/components/post-list.svelte";
	import PostSectionList from "$lib/components/post-section-list.svelte";
	import { site } from "$lib/site";

	let { data } = $props();

	function splitTrailingPeriod(title: string) {
		if (title.endsWith(".")) {
			return { text: title.slice(0, -1), period: true as const };
		}

		return { text: title, period: false as const };
	}
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<section class="mx-auto flex max-w-4xl flex-col gap-8 px-8 py-12">
	<div class="flex flex-col gap-2">
		<h1 class="font-serif text-2xl font-semibold tracking-normal sm:text-3xl">
			<span class="text-primary">사람</span>을 먼저 생각하는 조금 특이한 개발자의 기록<span class="text-primary">.</span>
		</h1>
		<p class="font-serif text-muted-foreground text-base leading-7 mb-4">
			{site.description}
		</p>
	</div>

	<Separator />

	<div class="flex flex-col gap-16">
		<div class="flex flex-col gap-6">
			<div class="flex items-end justify-between gap-4">
				<h2 class="font-serif text-xl font-medium tracking-tight">최근 글<span class="text-primary">.</span></h2>
				<Button variant='ghost' color='secondary' href={resolve("/posts")}>전체 보기</Button>
			</div>
			<PostList posts={data.posts} />
		</div>

		{#each data.sections as section (section.id)}
			{@const heading = splitTrailingPeriod(section.title)}
			<div class="flex flex-col gap-6">
				<h2 class="font-serif text-xl font-medium tracking-tight">
					{heading.text}{#if heading.period}<span class="text-primary">.</span>{/if}
				</h2>
				<PostSectionList posts={section.posts} />
			</div>
		{/each}
	</div>
</section>
