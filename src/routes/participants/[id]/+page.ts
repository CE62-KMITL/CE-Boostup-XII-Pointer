import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const id = params.id;
	if (!id.match(/^[0-9a-z]{15}$/)) {
		error(404, 'Not found');
	}
	return { id };
};
