import type { UserAuthModel } from '$lib/interfaces/userAuthModel.interface.js';

export const load = ({ locals }): { user: UserAuthModel | undefined } => {
	return {
		user: locals.user || undefined
	};
};
