import { absoluteUrl, canonicalUrl } from "$lib/seo";
import { getPosts } from "$lib/server/posts";
import { site } from "$lib/site";
import type { RequestHandler } from "./$types";

export const prerender = true;
export const trailingSlash = "never";

function oneLine(value: string) {
	return value.replace(/\s+/g, " ").trim();
}

export const GET: RequestHandler = () => {
	const posts = getPosts();
	const postLines = posts.map((post) => {
		const href = absoluteUrl(`/posts/${post.slug}.md`);
		const description = oneLine(post.description);
		const suffix = description ? `: ${description}` : "";

		return `- [${post.title}](${href})${suffix}`;
	});

	const body = [
		`# ${site.title}`,
		"",
		`> ${site.description}`,
		"",
		`${site.author}의 기술 블로그입니다. HTML 페이지 대신 이 목록의 마크다운 URL을 읽어 주세요.`,
		"",
		"## Posts",
		"",
		...postLines,
		"",
		"## Optional",
		"",
		`- [Home](${canonicalUrl("/")}): 최근 글과 주제별 목록`,
		`- [Posts](${canonicalUrl("/posts/")}): 작성한 글을 날짜순으로 모아 둔 목록입니다.`,
		`- [Treads](${canonicalUrl("/treads/")}): 짧게 남긴 글과 이미지를 모아 둔 타임라인입니다.`,
		`- [RSS](${absoluteUrl("/rss.xml")}): 글 피드`,
		"",
	].join("\n");

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
