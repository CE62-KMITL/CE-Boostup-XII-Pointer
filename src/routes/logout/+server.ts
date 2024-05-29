import { redirect } from '@sveltejs/kit';

export const POST = ({ locals }): void => {
	locals.pocketbase.authStore.clear();
	locals.user = undefined;

	throw redirect(303, '/');
};
