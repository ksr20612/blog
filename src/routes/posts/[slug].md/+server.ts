import { error } from "@sveltejs/kit";
import { getPostSource, getPosts } from "$lib/server/posts";
import type { EntryGenerator, RequestHandler } from "./$types";

export const prerender = true;
export const trailingSlash = "never";

export const entries: EntryGenerator = () => {
	return getPosts().map((post) => ({ slug: post.slug }));
};

export const GET: RequestHandler = ({ params }) => {
	const source = getPostSource(params.slug);

	if (!source) {
		error(404, "글을 찾을 수 없어요.");
	}

	return new Response(source, {
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
