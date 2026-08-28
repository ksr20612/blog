import grayMatter from "gray-matter";
import { Marked } from "marked";
import { createHighlighter, type Highlighter } from "shiki";
import type { Post, PostMeta } from "$lib/types";

type Frontmatter = {
	title?: unknown;
	description?: unknown;
	date?: unknown;
	tags?: unknown;
	draft?: unknown;
};

const files = import.meta.glob("../../../content/posts/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

const HIGHLIGHT_LANGS = [
	"typescript",
	"javascript",
	"svelte",
	"bash",
	"json",
	"css",
	"html",
	"markdown",
	"python",
	"go",
	"rust",
	"yaml",
	"tsx",
] as const;

const LANG_ALIASES: Record<string, (typeof HIGHLIGHT_LANGS)[number]> = {
	ts: "typescript",
	js: "javascript",
	mjs: "javascript",
	cjs: "javascript",
	md: "markdown",
	py: "python",
	yml: "yaml",
	sh: "bash",
	shell: "bash",
	zsh: "bash",
};

function resolveHighlightLang(lang: string | undefined) {
	if (!lang) {
		return "text";
	}

	const normalized = LANG_ALIASES[lang] ?? lang;

	if ((HIGHLIGHT_LANGS as readonly string[]).includes(normalized)) {
		return normalized;
	}

	return "text";
}

let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter() {
	highlighterPromise ??= createHighlighter({
		themes: ["github-light", "github-dark"],
		langs: [...HIGHLIGHT_LANGS],
	});

	return highlighterPromise;
}

function slugFromPath(path: string) {
	const fileName = path.split("/").pop() ?? path;
	return fileName.replace(/\.md$/, "");
}

function asString(value: unknown) {
	return typeof value === "string" ? value : "";
}

function asDateString(value: unknown) {
	if (typeof value === "string") {
		return value.slice(0, 10);
	}

	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}

	return "";
}

function asStringArray(value: unknown) {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((item): item is string => typeof item === "string");
}

function parseMeta(
	path: string,
	raw: string,
): { meta: PostMeta; body: string } {
	if (typeof raw !== "string" || raw.trim() === "") {
		throw new Error(`Empty markdown at ${path}: ${typeof raw}`);
	}

	const { data, content } = grayMatter(raw) as {
		data: Frontmatter;
		content: string;
	};
	const title = asString(data.title);
	const date = asDateString(data.date);

	if (!title || !date) {
		throw new Error(
			`Invalid frontmatter in ${path}: title and date are required.`,
		);
	}

	return {
		meta: {
			slug: slugFromPath(path),
			title,
			description: asString(data.description),
			date,
			tags: asStringArray(data.tags),
			draft: data.draft === true,
		},
		body: content,
	};
}

const parsed = Object.entries(files).map(([path, raw]) => parseMeta(path, raw));

export function getPosts(): PostMeta[] {
	return parsed
		.map(({ meta }) => meta)
		.filter((post) => !post.draft)
		.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getTags() {
	return [...new Set(getPosts().flatMap((post) => post.tags))].sort((a, b) =>
		a.localeCompare(b),
	);
}

async function renderMarkdown(markdown: string) {
	const highlighter = await getHighlighter();
	const marked = new Marked({
		gfm: true,
		renderer: {
			code({ text, lang }) {
				return highlighter.codeToHtml(text, {
					lang: resolveHighlightLang(lang),
					themes: {
						light: "github-light",
						dark: "github-dark",
					},
					defaultColor: false,
				});
			},
		},
	});

	return marked.parse(markdown) as string;
}

export async function getPost(slug: string): Promise<Post | undefined> {
	const match = parsed.find(({ meta }) => meta.slug === slug && !meta.draft);

	if (!match) {
		return undefined;
	}

	return {
		...match.meta,
		html: await renderMarkdown(match.body),
	};
}
