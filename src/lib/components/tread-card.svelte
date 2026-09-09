<script lang="ts">
	import * as Card from "$lib/components/ui/card/index.js";
	import { formatDate } from "$lib/format";
	import type { Tread } from "$lib/types";
	import { cn } from "$lib/utils.js";
	import MarkdownBody from "./markdown-body.svelte";
	import TreadImages from "./tread-images.svelte";

	let { tread }: { tread: Tread } = $props();

	const hasBody = $derived(tread.html.trim() !== "");
	const hasImages = $derived(tread.images.length > 0);
</script>

<article>
	<Card.Root class={cn("text-base ring-[#efeeeb]", hasImages && "pt-0")}>
		<TreadImages images={tread.images} />
		<Card.Header>
			<time class="text-muted-foreground text-xs" datetime={tread.date}>
				{formatDate(tread.date)}
			</time>
		</Card.Header>
		{#if hasBody}
			<Card.Content>
				<MarkdownBody html={tread.html} class="prose-sm max-w-none text-sm! leading-relaxed!" />
			</Card.Content>
		{/if}
	</Card.Root>
</article>
