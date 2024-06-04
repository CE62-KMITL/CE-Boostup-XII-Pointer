import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
	return /^[0-9a-z]{15}$/.test(param);
};
