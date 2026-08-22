import { getPosts } from "$lib/server/posts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
	return {
		posts: getPosts().slice(0, 4),
	};
};
