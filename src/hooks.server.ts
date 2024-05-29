import { type Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

import { PRIVATE_POCKETBASE_URL } from '$env/static/private';
import type { UserAuthModel } from '$lib/interfaces/userAuthModel.interface';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pocketbase = new PocketBase(PRIVATE_POCKETBASE_URL);

	event.locals.pocketbase.authStore.loadFromCookie(event.request.headers.get('cookie') ?? '');

	if (event.locals.pocketbase.authStore.isValid) {
		try {
			await event.locals.pocketbase.collection('users').authRefresh();
		} catch (_) {
			event.locals.pocketbase.authStore.clear();
		}
	} else {
		event.locals.pocketbase.authStore.clear();
	}

	event.locals.user = event.locals.pocketbase.authStore.model as UserAuthModel | undefined;

	const response = await resolve(event);

	response.headers.append(
		'set-cookie',
		event.locals.pocketbase.authStore.exportToCookie({
			httpOnly: false
		})
	);

	return response;
};
