export type PostMeta = {
	slug: string;
	title: string;
	description: string;
	date: string;
	tags: string[];
	sections: string[];
	draft: boolean;
};

export type AdjacentPost = Pick<PostMeta, "slug" | "title">;

export type TocItem = {
	id: string;
	text: string;
	depth: 2 | 3;
};

export type Post = PostMeta & {
	html: string;
	toc: TocItem[];
};

export type TreadImage = {
	src: string;
	alt: string;
};

export type TreadMeta = {
	slug: string;
	date: string;
	draft: boolean;
	images: TreadImage[];
};

export type Tread = TreadMeta & {
	html: string;
};
