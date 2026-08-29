import grayMatter from "gray-matter";
import { Marked } from "marked";
import { createHighlighter, type Highlighter } from "shiki";
import type { Post, PostMeta, TocItem } from "$lib/types";

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
	const counts = new Map<string, number>();

	for (const post of getPosts()) {
		for (const tag of post.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}

	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([tag]) => tag);
}

function slugifyHeading(text: string) {
	const slug = text
		.trim()
		.toLowerCase()
		.replace(/[^\p{Letter}\p{Number}\p{Mark}\s-]/gu, "")
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");

	return slug || "section";
}

function uniqueHeadingId(counts: Map<string, number>, text: string) {
	const base = slugifyHeading(text);
	const used = counts.get(base) ?? 0;
	counts.set(base, used + 1);
	return used === 0 ? base : `${base}-${used}`;
}

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

async function renderMarkdown(markdown: string): Promise<{
	html: string;
	toc: TocItem[];
}> {
	const highlighter = await getHighlighter();
	const toc: TocItem[] = [];
	const usedIds = new Map<string, number>();
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
			heading({ text, depth }) {
				const id = uniqueHeadingId(usedIds, text);

				if (depth === 2 || depth === 3) {
					toc.push({ id, text, depth });
				}

				return `<h${depth} id="${escapeHtml(id)}">${escapeHtml(text)}</h${depth}>\n`;
			},
		},
	});

	const html = await marked.parse(markdown);
	return { html, toc };
}

export async function getPost(slug: string): Promise<Post | undefined> {
	const match = parsed.find(({ meta }) => meta.slug === slug && !meta.draft);

	if (!match) {
		return undefined;
	}

	const { html, toc } = await renderMarkdown(match.body);

	return {
		...match.meta,
		html,
		toc,
	};
}
