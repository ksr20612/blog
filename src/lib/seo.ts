import { site } from "$lib/site";

export type SeoOgType = "website" | "article";

export type SeoData = {
	title: string;
	description: string;
	ogType: SeoOgType;
	headline?: string;
	publishedTime?: string;
	tags?: string[];
	markdownPath?: string;
};

const siteUrl = site.url.replace(/\/$/, "");
const siteBasePath = new URL(site.url).pathname.replace(/\/$/, "");

function stripSiteBase(path: string) {
	if (
		siteBasePath &&
		(path === siteBasePath || path.startsWith(`${siteBasePath}/`))
	) {
		return path.slice(siteBasePath.length) || "/";
	}

	return path;
}

export function absoluteUrl(path: string) {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return `${siteUrl}${stripSiteBase(normalized)}`;
}

export function canonicalUrl(pathname: string) {
	const url = absoluteUrl(pathname);
	const path = new URL(url).pathname;

	if (path.endsWith("/") || /\.[a-z0-9]+$/i.test(path)) {
		return url;
	}

	return `${url}/`;
}

export function rssUrl() {
	return absoluteUrl("/rss.xml");
}

export function sitemapUrl() {
	return absoluteUrl("/sitemap.xml");
}

export const ogImage = {
	url: absoluteUrl("/og.webp"),
	width: 419,
	height: 720,
	type: "image/webp",
	alt: `${site.author} 프로필`,
} as const;

export function escapeXml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

export function serializeJsonLd(data: unknown) {
	return JSON.stringify(data).replaceAll("<", "\\u003c");
}

export function jsonLdScriptTag(data: unknown) {
	return `<script type="application/ld+json">${serializeJsonLd(data)}</script>`;
}

function person() {
	return {
		"@type": "Person" as const,
		name: site.author,
		url: site.profile,
		image: ogImage.url,
		sameAs: [site.github],
	};
}

export function websiteJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: site.title,
		url: canonicalUrl("/"),
		description: site.description,
		inLanguage: "ko",
		author: person(),
	};
}

function blogPostingJsonLd(input: {
	headline: string;
	description: string;
	canonical: string;
	publishedTime: string;
	tags: string[];
}) {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: input.headline,
		description: input.description,
		datePublished: input.publishedTime,
		dateModified: input.publishedTime,
		url: input.canonical,
		mainEntityOfPage: input.canonical,
		image: ogImage.url,
		inLanguage: "ko",
		author: person(),
		publisher: person(),
		isPartOf: {
			"@type": "WebSite",
			name: site.title,
			url: canonicalUrl("/"),
		},
		...(input.tags.length > 0 ? { keywords: input.tags.join(", ") } : {}),
	};
}

function breadcrumbJsonLd(items: { name: string; path: string }[]) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: canonicalUrl(item.path),
		})),
	};
}

export function jsonLdForPage(seo: SeoData, pathname: string) {
	if (seo.ogType === "article" && seo.publishedTime) {
		const headline = seo.headline ?? seo.title;
		const canonical = canonicalUrl(pathname);

		return [
			blogPostingJsonLd({
				headline,
				description: seo.description,
				canonical,
				publishedTime: seo.publishedTime,
				tags: seo.tags ?? [],
			}),
			breadcrumbJsonLd([
				{ name: "Home", path: "/" },
				{ name: "Posts", path: "/posts/" },
				{ name: headline, path: pathname },
			]),
		];
	}

	return [websiteJsonLd()];
}
