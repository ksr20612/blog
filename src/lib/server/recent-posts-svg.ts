import faviconPng from "$lib/assets/favicon-32x32.png?inline";
import type { PostMeta } from "$lib/types";

export const RECENT_POSTS_CARD_COUNT = 5;

type RecentPost = Pick<PostMeta, "title">;

const WIDTH = 450;
const PADDING_X = 16;
const PADDING_Y = 14;
const HEADER_HEIGHT = 28;
const DIVIDER_GAP = 6;
const ROW_HEIGHT = 28;
const TITLE_FONT_SIZE = 13;
const ICON_SIZE = 14;
const ICON_GAP = 6;

function escapeXml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function charWidth(char: string, fontSize: number) {
	const code = char.codePointAt(0) ?? 0;

	if (code > 0x2e80) {
		return fontSize * 0.95;
	}

	return fontSize * 0.56;
}

function estimateWidth(text: string, fontSize: number) {
	let width = 0;

	for (const char of text) {
		width += charWidth(char, fontSize);
	}

	return width;
}

function truncateToWidth(text: string, fontSize: number, maxWidth: number) {
	if (estimateWidth(text, fontSize) <= maxWidth) {
		return text;
	}

	const ellipsis = "…";
	const ellipsisWidth = estimateWidth(ellipsis, fontSize);
	let result = "";

	for (const char of text) {
		const next = result + char;

		if (estimateWidth(next, fontSize) + ellipsisWidth > maxWidth) {
			return `${result}${ellipsis}`;
		}

		result = next;
	}

	return result;
}

export function renderRecentPostsSvg(input: {
	title: string;
	posts: RecentPost[];
}) {
	const posts = input.posts.slice(0, RECENT_POSTS_CARD_COUNT);
	const bodyHeight =
		posts.length === 0 ? ROW_HEIGHT : posts.length * ROW_HEIGHT;
	const height =
		PADDING_Y + HEADER_HEIGHT + DIVIDER_GAP + bodyHeight + PADDING_Y;
	const titleMaxWidth = WIDTH - PADDING_X * 2;
	const dividerY = PADDING_Y + HEADER_HEIGHT;
	const description =
		posts.length === 0
			? "아직 글이 없습니다."
			: posts.map((post) => post.title).join(". ");

	const rows =
		posts.length === 0
			? `<text class="label" x="${PADDING_X}" y="${dividerY + DIVIDER_GAP + 18}" font-size="12">아직 글이 없습니다</text>`
			: posts
					.map((post, index) => {
						const y = dividerY + DIVIDER_GAP + 18 + index * ROW_HEIGHT;
						const title = truncateToWidth(
							post.title,
							TITLE_FONT_SIZE,
							titleMaxWidth,
						);

						return `<text class="post-title" x="${PADDING_X}" y="${y}" font-size="${TITLE_FONT_SIZE}">${escapeXml(title)}</text>`;
					})
					.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-labelledby="svg-title svg-desc">
  <title id="svg-title">${escapeXml(input.title)} 최근 글</title>
  <desc id="svg-desc">${escapeXml(description)}</desc>
  <style>
    text {
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    }
    .frame { fill: none; stroke: #d4d4d4; }
    .brand, .post-title { fill: #171717; }
    .label { fill: #5c5c5c; }
    .divider { stroke: #d4d4d4; }
    @media (prefers-color-scheme: dark) {
      .frame { stroke: #444444; }
      .brand, .post-title { fill: #f5f5f5; }
      .label { fill: #c4c4c4; }
      .divider { stroke: #444444; }
    }
  </style>
  <rect class="frame" x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="8" />
  <image href="${faviconPng}" x="${PADDING_X}" y="${PADDING_Y + 1}" width="${ICON_SIZE}" height="${ICON_SIZE}" />
  <text class="brand" x="${PADDING_X + ICON_SIZE + ICON_GAP}" y="${PADDING_Y + 15}" font-size="14" font-weight="700">${escapeXml(input.title)}</text>
  <text class="label" x="${WIDTH - PADDING_X}" y="${PADDING_Y + 15}" font-size="12" text-anchor="end">최근 글</text>
  <line class="divider" x1="${PADDING_X}" y1="${dividerY}" x2="${WIDTH - PADDING_X}" y2="${dividerY}" />
  ${rows}
</svg>
`;
}
