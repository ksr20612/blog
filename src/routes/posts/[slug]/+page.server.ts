import { error } from "@sveltejs/kit";
import { getAdjacentPosts, getPost, getPosts } from "$lib/server/posts";
import type { EntryGenerator, PageServerLoad } from "./$types";

export const entries: EntryGenerator = () => {
  return getPosts().map((post) => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
  const post = await getPost(params.slug);

  if (!post) {
    error(404, "글을 찾을 수 없어요.");
  }

  return {
    post,
    ...getAdjacentPosts(params.slug),
  };
};
