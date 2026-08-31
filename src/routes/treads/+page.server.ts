import { getTreads } from "$lib/server/treads";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
	return {
		treads: getTreads(),
	};
};
