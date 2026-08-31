import grayMatter from "gray-matter";
import { Marked } from "marked";
import type { Tread, TreadImage, TreadMeta } from "$lib/types";

type Frontmatter = {
	date?: unknown;
	draft?: unknown;
	images?: unknown;
};

const files = import.meta.glob("../../../content/treads/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
}) as Record<string, string>;

const marked = new Marked({ gfm: true });

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

function asImages(value: unknown, path: string): TreadImage[] {
	if (value === undefined) {
		return [];
	}

	if (!Array.isArray(value)) {
		throw new Error(`Invalid frontmatter in ${path}: images must be an array.`);
	}

	return value.map((item, index) => {
		if (!item || typeof item !== "object") {
			throw new Error(
				`Invalid frontmatter in ${path}: images[${index}] must be an object with src and alt.`,
			);
		}

		const src = asString((item as { src?: unknown }).src);
		const alt = asString((item as { alt?: unknown }).alt);

		if (!src || !alt) {
			throw new Error(
				`Invalid frontmatter in ${path}: images[${index}] requires src and alt.`,
			);
		}

		return { src, alt };
	});
}

function renderBody(markdown: string) {
	return marked.parse(markdown, { async: false });
}

function parseTread(path: string, raw: string): Tread {
	if (typeof raw !== "string" || raw.trim() === "") {
		throw new Error(`Empty markdown at ${path}: ${typeof raw}`);
	}

	const { data, content } = grayMatter(raw) as {
		data: Frontmatter;
		content: string;
	};
	const date = asDateString(data.date);

	if (!date) {
		throw new Error(`Invalid frontmatter in ${path}: date is required.`);
	}

	const meta: TreadMeta = {
		slug: slugFromPath(path),
		date,
		draft: data.draft === true,
		images: asImages(data.images, path),
	};

	return {
		...meta,
		html: renderBody(content),
	};
}

const parsed = Object.entries(files).map(([path, raw]) =>
	parseTread(path, raw),
);

export function getTreads(): Tread[] {
	return parsed
		.filter((tread) => !tread.draft)
		.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
