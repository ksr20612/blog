<script lang="ts">
	import { enhanceCodeBlocks } from "$lib/attachments/code-blocks";

	let { html }: { html: string } = $props();
</script>

<div class="markdown-body prose prose-neutral dark:prose-invert max-w-5xl" {@attach enhanceCodeBlocks}>
	{@html html}
</div>
