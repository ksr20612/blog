import { getTreads } from "$lib/server/treads";
import { site } from "$lib/site";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
	return {
		seo: {
			title: `Treads | ${site.title}`,
			description: "짧게 남긴 글과 이미지를 모아 둔 타임라인입니다.",
			ogType: "website" as const,
		},
		treads: getTreads(),
	};
};
