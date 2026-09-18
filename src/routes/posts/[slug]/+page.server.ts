import { error } from "@sveltejs/kit";
import { getAdjacentPosts, getPost, getPosts } from "$lib/server/posts";
import { site } from "$lib/site";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const entries: EntryGenerator = () => {
	return getPosts().map((post) => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);

	if (!post) {
		error(404, "글을 찾을 수 없어요.");
	}

	return {
		seo: {
			title: `${post.title} · ${site.title}`,
			headline: post.title,
			description: post.description || site.description,
			ogType: "article" as const,
			publishedTime: post.date,
			tags: post.tags,
			markdownPath: `/posts/${post.slug}.md`,
		},
		post,
		...getAdjacentPosts(params.slug),
	};
};
