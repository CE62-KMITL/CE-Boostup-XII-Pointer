import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return {
		id: params.id,
		subpage: params.subpage as 'add-score' | 'subtract-score' | 'transaction' | undefined
	};
};
