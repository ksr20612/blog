export type PostMeta = {
	slug: string;
	title: string;
	description: string;
	date: string;
	tags: string[];
	draft: boolean;
};

export type Post = PostMeta & {
	html: string;
};
