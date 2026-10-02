<script lang="ts">
	import { enhanceCodeBlocks } from "$lib/attachments/code-blocks";
	import { enhanceHeadingLinks } from "$lib/attachments/heading-links";
	import { cn } from "$lib/utils.js";

	let {
		html,
		class: className,
		headingLinks = false,
	}: {
		html: string;
		class?: string;
		headingLinks?: boolean;
	} = $props();
</script>

<div
	class={cn("markdown-body prose prose-neutral dark:prose-invert max-w-4xl", className)}
	data-heading-links={headingLinks ? "" : undefined}
	{@attach enhanceCodeBlocks}
	{@attach enhanceHeadingLinks}
>
	{@html html}
</div>
