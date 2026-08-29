<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Empty from "$lib/components/ui/empty/index.js";
	import { site } from "$lib/site";

	let title = $derived(page.status === 404 ? "페이지를 찾을 수 없어요" : "문제가 발생했어요");
	let description = $derived(
		page.status === 404
			? "주소가 바뀌었거나 글이 없어요."
			: page.error?.message ?? "잠시 후 다시 시도해 주세요.",
	);
</script>

<svelte:head>
	<title>{title} · {site.title}</title>
</svelte:head>

<section class="mx-auto flex max-w-4xl px-4 py-16">
	<Empty.Root class="border">
		<Empty.Header>
			<Empty.Title>{title}</Empty.Title>
			<Empty.Description>{description}</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<Button href={resolve("/")}>홈으로 돌아가기</Button>
		</Empty.Content>
	</Empty.Root>
</section>
