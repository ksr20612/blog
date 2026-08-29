export type PostMeta = {
	slug: string;
	title: string;
	description: string;
	date: string;
	tags: string[];
	draft: boolean;
};

export type TocItem = {
	id: string;
	text: string;
	depth: 2 | 3;
};

export type Post = PostMeta & {
	html: string;
	toc: TocItem[];
};
