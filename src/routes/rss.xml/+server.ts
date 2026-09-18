import { canonicalUrl, escapeXml, rssUrl } from "$lib/seo";
import { getPosts } from "$lib/server/posts";
import { site } from "$lib/site";
import type { RequestHandler } from "./$types";

export const prerender = true;
export const trailingSlash = "never";

export const GET: RequestHandler = () => {
	const posts = getPosts();
	const feedUrl = escapeXml(rssUrl());
	const homeUrl = escapeXml(canonicalUrl("/"));

	const items = posts
		.map((post) => {
			const link = escapeXml(canonicalUrl(`/posts/${post.slug}/`));
			const pubDate = new Date(`${post.date}T00:00:00.000Z`).toUTCString();

			return [
				"\t\t<item>",
				`\t\t\t<title>${escapeXml(post.title)}</title>`,
				`\t\t\t<link>${link}</link>`,
				`\t\t\t<guid isPermaLink="true">${link}</guid>`,
				`\t\t\t<pubDate>${pubDate}</pubDate>`,
				post.description
					? `\t\t\t<description>${escapeXml(post.description)}</description>`
					: undefined,
				"\t\t</item>",
			]
				.filter(Boolean)
				.join("\n");
		})
		.join("\n");

	const xml = [
		`<?xml version="1.0" encoding="UTF-8" ?>`,
		`<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
		"\t<channel>",
		`\t\t<title>${escapeXml(site.title)}</title>`,
		`\t\t<link>${homeUrl}</link>`,
		`\t\t<description>${escapeXml(site.description)}</description>`,
		"\t\t<language>ko</language>",
		`\t\t<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
		items,
		"\t</channel>",
		"</rss>",
		"",
	].join("\n");

	return new Response(xml, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
