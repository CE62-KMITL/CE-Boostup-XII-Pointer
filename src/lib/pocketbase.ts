import PocketBase from 'pocketbase';
import { readable } from 'svelte/store';
import { toast } from 'svelte-sonner';

import { type UserAuthModel } from './interfaces/user-auth-model.interface';

import { browser } from '$app/environment';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export const pocketbase = new PocketBase(PUBLIC_POCKETBASE_URL);

export const currentUser = browser
	? readable<UserAuthModel | undefined>(
			pocketbase.authStore.model as UserAuthModel | undefined,
			function start(set) {
				const unsubscribe = pocketbase.authStore.onChange((): void => {
					set(pocketbase.authStore.model as UserAuthModel | undefined);
				});
				return function stop(): void {
					unsubscribe();
				};
			}
		)
	: readable<UserAuthModel | undefined>(undefined);

async function refresh(): Promise<void> {
	try {
		await pocketbase.collection('users').authRefresh();
	} catch (err) {
		console.error(err);
		pocketbase.authStore.clear();
		toast.warning('Your session has expired', {
			description: 'Please log in again'
		});
	}
}

if (browser) {
	if (pocketbase.authStore.isValid) {
		refresh();
	} else {
		pocketbase.authStore.clear();
	}
}
