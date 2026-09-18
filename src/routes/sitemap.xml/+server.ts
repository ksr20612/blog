import { canonicalUrl, escapeXml } from "$lib/seo";
import { getPosts } from "$lib/server/posts";
import type { RequestHandler } from "./$types";

export const prerender = true;
export const trailingSlash = "never";

function urlEntry(path: string, lastmod?: string) {
	const loc = escapeXml(canonicalUrl(path));
	const lastmodTag = lastmod
		? `\n\t\t<lastmod>${escapeXml(lastmod)}</lastmod>`
		: "";

	return `\t<url>\n\t\t<loc>${loc}</loc>${lastmodTag}\n\t</url>`;
}

export const GET: RequestHandler = () => {
	const posts = getPosts();
	const urls = [
		urlEntry("/"),
		urlEntry("/posts/"),
		urlEntry("/treads/"),
		...posts.map((post) => urlEntry(`/posts/${post.slug}/`, post.date)),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8" ?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
