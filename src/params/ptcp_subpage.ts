import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	return ['add-score', 'subtract-score', 'transaction'].includes(param);
};
