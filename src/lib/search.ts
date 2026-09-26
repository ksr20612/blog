import type { PostMeta } from "$lib/types";

export type SearchableListPost = PostMeta & {
	text?: string;
};

export type SearchSnippet = {
	before: string;
	match: string;
	after: string;
};

const SNIPPET_RADIUS = 42;

export function normalizeSearch(value: string) {
	return value.trim().toLocaleLowerCase("ko-KR");
}

export function toSearchText(markdown: string) {
	return markdown
		.replace(/```[^\n]*\n([\s\S]*?)```/g, " $1 ")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/!\[[^\]]*]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/^\s*>\s?/gm, "")
		.replace(/^\s*[-*+]\s+/gm, "")
		.replace(/^\s*\d+\.\s+/gm, "")
		.replace(/[*~]+/g, "")
		.replace(/_{2,}/g, "")
		.replace(/\|/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function postMatchesQuery(post: SearchableListPost, query: string) {
	const needle = normalizeSearch(query);
	if (!needle) {
		return true;
	}

	const haystack = [
		post.title,
		post.description,
		...post.tags,
		post.text ?? "",
	].join("\n");
	return haystack.toLocaleLowerCase("ko-KR").includes(needle);
}

export function bodySnippet(
	post: SearchableListPost,
	query: string,
): SearchSnippet | null {
	const needle = normalizeSearch(query);
	const text = post.text;
	if (!needle || !text) {
		return null;
	}

	const inTitle = post.title.toLocaleLowerCase("ko-KR").includes(needle);
	const inDescription = post.description
		.toLocaleLowerCase("ko-KR")
		.includes(needle);
	if (inTitle || inDescription) {
		return null;
	}

	const index = text.toLocaleLowerCase("ko-KR").indexOf(needle);
	if (index === -1) {
		return null;
	}

	const start = Math.max(0, index - SNIPPET_RADIUS);
	const end = Math.min(text.length, index + needle.length + SNIPPET_RADIUS);

	return {
		before: `${start > 0 ? "…" : ""}${text.slice(start, index).trimStart()}`,
		match: text.slice(index, index + needle.length),
		after: `${text.slice(index + needle.length, end).trimEnd()}${end < text.length ? "…" : ""}`,
	};
}
