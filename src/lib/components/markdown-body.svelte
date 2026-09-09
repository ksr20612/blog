<script lang="ts">
	import { enhanceCodeBlocks } from "$lib/attachments/code-blocks";
	import { cn } from "$lib/utils.js";

	let { html, class: className }: { html: string; class?: string } = $props();
</script>

<div
	class={cn("markdown-body prose prose-neutral dark:prose-invert max-w-4xl", className)}
	{@attach enhanceCodeBlocks}
>
	{@html html}
</div>
