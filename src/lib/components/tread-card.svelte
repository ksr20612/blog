<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { formatDate } from "$lib/format";
	import type { Tread } from "$lib/types";
	import MarkdownBody from "./markdown-body.svelte";
	import TreadImages from "./tread-images.svelte";

	let { tread }: { tread: Tread } = $props();

	const hasBody = $derived(tread.html.trim() !== "");
</script>

<article>
	<Card.Root class="text-base ring-[#efeeeb]">
		<Card.Header>
			<time class="text-muted-foreground text-xs" datetime={tread.date}>
				{formatDate(tread.date)}
			</time>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			{#if hasBody}
				<MarkdownBody html={tread.html} />
			{/if}
			<TreadImages images={tread.images} />
		</Card.Content>
	</Card.Root>
</article>
