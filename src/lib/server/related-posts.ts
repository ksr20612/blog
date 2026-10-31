import type { PostMeta } from "$lib/types";
import { getAdjacentPosts, getPosts } from "./posts";

const IGNORED_TAGS = new Set(["note"]);
const MIN_RELATED = 2;
const MAX_RELATED = 3;

function usableTags(tags: readonly string[]) {
	return [...new Set(tags.filter((tag) => !IGNORED_TAGS.has(tag)))];
}

function tagDocumentFrequency(posts: readonly PostMeta[]) {
	const counts = new Map<string, number>();

	for (const post of posts) {
		for (const tag of usableTags(post.tags)) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}

	return counts;
}

function idfWeights(posts: readonly PostMeta[]) {
	const total = posts.length;
	const weights = new Map<string, number>();

	if (total === 0) {
		return weights;
	}

	for (const [tag, count] of tagDocumentFrequency(posts)) {
		weights.set(tag, Math.log(total / count));
	}

	return weights;
}

function median(values: readonly number[]) {
	if (values.length === 0) {
		return Number.POSITIVE_INFINITY;
	}

	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	const high = sorted[middle] ?? Number.POSITIVE_INFINITY;

	if (sorted.length % 2 === 0) {
		const low = sorted[middle - 1] ?? high;
		return (low + high) / 2;
	}

	return high;
}

function dateDistance(left: string, right: string) {
	return Math.abs(
		Date.parse(`${left}T00:00:00`) - Date.parse(`${right}T00:00:00`),
	);
}

function sharesSection(current: PostMeta, candidate: PostMeta) {
	return current.sections.some((section) =>
		candidate.sections.includes(section),
	);
}

export function selectRelatedPosts(
	current: PostMeta,
	posts: readonly PostMeta[],
	options: { excludeSlugs?: readonly string[] } = {},
): PostMeta[] {
	const excluded = new Set(options.excludeSlugs);
	excluded.add(current.slug);

	const weights = idfWeights(posts);
	const rareThreshold = median([...weights.values()]);
	const currentTags = usableTags(current.tags);

	const ranked = posts
		.filter((post) => !excluded.has(post.slug))
		.map((post) => {
			const shared = usableTags(post.tags).filter((tag) =>
				currentTags.includes(tag),
			);
			const score = shared.reduce(
				(sum, tag) => sum + (weights.get(tag) ?? 0),
				0,
			);
			const rareShared = shared.some(
				(tag) => (weights.get(tag) ?? 0) > rareThreshold,
			);

			return {
				post,
				score,
				qualified: shared.length >= 2 || rareShared,
				sameSection: sharesSection(current, post),
				recency: dateDistance(current.date, post.date),
			};
		})
		.filter((item) => item.qualified)
		.sort((left, right) => {
			if (left.score !== right.score) {
				return right.score - left.score;
			}

			if (left.sameSection !== right.sameSection) {
				return Number(right.sameSection) - Number(left.sameSection);
			}

			if (left.recency !== right.recency) {
				return left.recency - right.recency;
			}

			return left.post.slug.localeCompare(right.post.slug);
		});

	if (ranked.length < MIN_RELATED) {
		return [];
	}

	return ranked.slice(0, MAX_RELATED).map((item) => item.post);
}

export function getRelatedPosts(slug: string): PostMeta[] {
	const posts = getPosts();
	const current = posts.find((post) => post.slug === slug);

	if (!current) {
		return [];
	}

	const { previous, next } = getAdjacentPosts(slug);

	return selectRelatedPosts(current, posts, {
		excludeSlugs: [previous?.slug, next?.slug].filter(
			(value): value is string => Boolean(value),
		),
	});
}
