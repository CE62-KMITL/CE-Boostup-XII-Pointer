import PocketBase from 'pocketbase';
import { readable } from 'svelte/store';
import { toast } from 'svelte-sonner';

import { type UserAuthModel } from './interfaces/user-auth-model.interface';

import { browser } from '$app/environment';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export const pocketbase = new PocketBase(PUBLIC_POCKETBASE_URL);

export const currentUser = browser
	? readable<UserAuthModel | null>(
			pocketbase.authStore.model as UserAuthModel | null,
			function start(set) {
				const unsubscribe = pocketbase.authStore.onChange((): void => {
					set(pocketbase.authStore.model as UserAuthModel | null);
				});
				return function stop(): void {
					unsubscribe();
				};
			}
		)
	: readable<UserAuthModel | null>(null);

export function logout(): void {
	pocketbase.collection('users').unsubscribe();
	pocketbase.collection('participants').unsubscribe();
	pocketbase.collection('groups').unsubscribe();
	pocketbase.collection('items').unsubscribe();
	pocketbase.authStore.clear();
}

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
