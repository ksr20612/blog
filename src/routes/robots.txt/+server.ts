import { sitemapUrl } from "$lib/seo";
import type { RequestHandler } from "./$types";

export const prerender = true;
export const trailingSlash = "never";

export const GET: RequestHandler = () => {
	const body = [
		"# allow crawling everything by default",
		"User-agent: *",
		"Disallow:",
		"",
		`Sitemap: ${sitemapUrl()}`,
		"",
	].join("\n");

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
