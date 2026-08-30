import { HOME_SECTION_POST_LIMIT, homeSections } from "$lib/home-sections";
import { getPosts, getSectionPosts } from "$lib/server/posts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
	const posts = getPosts().slice(0, 4);
	const recentSlugs = posts.map((post) => post.slug);

	return {
		posts,
		sections: homeSections
			.map((section) => ({
				...section,
				posts: getSectionPosts(section.id, {
					limit: HOME_SECTION_POST_LIMIT,
					excludeSlugs: recentSlugs,
				}),
			}))
			.filter((section) => section.posts.length > 0),
	};
};
