import { getPosts } from "$lib/server/posts";
import {
	RECENT_POSTS_CARD_COUNT,
	renderRecentPostsSvg,
} from "$lib/server/recent-posts-svg";
import { site } from "$lib/site";
import type { RequestHandler } from "./$types";

export const prerender = true;
export const trailingSlash = "never";

export const GET: RequestHandler = () => {
	const svg = renderRecentPostsSvg({
		title: site.title,
		posts: getPosts().slice(0, RECENT_POSTS_CARD_COUNT),
	});

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
