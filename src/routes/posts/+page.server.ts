import { getPosts, getTags } from "$lib/server/posts";
import { site } from "$lib/site";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
	return {
		seo: {
			title: `Posts | ${site.title}`,
			description: "작성한 글을 날짜순으로 모아 둔 목록입니다.",
			ogType: "website" as const,
		},
		posts: getPosts(),
		tags: getTags(),
	};
};
