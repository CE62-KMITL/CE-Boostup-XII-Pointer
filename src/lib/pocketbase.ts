import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';
import { toast } from 'svelte-sonner';

import { type UserAuthModel } from './interfaces/user-auth-model.interface';

import { browser } from '$app/environment';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export const pocketbase = new PocketBase(PUBLIC_POCKETBASE_URL);

export const currentUser = browser
	? writable<UserAuthModel | null | undefined>(undefined, function start(set) {
			const unsubscribe = pocketbase.authStore.onChange((): void => {
				set(pocketbase.authStore.model as UserAuthModel | null);
			});
			return function stop(): void {
				unsubscribe();
			};
		})
	: writable<UserAuthModel | null | undefined>(undefined);

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
		setTimeout(() => {
			toast.warning('Your session has expired', {
				description: 'Please log in again'
			});
		}, 1000);
	}
	currentUser.set(pocketbase.authStore.model as UserAuthModel | null);
}

if (browser) {
	if (pocketbase.authStore.isValid) {
		refresh();
	} else {
		pocketbase.authStore.clear();
		currentUser.set(null);
	}
} else {
	currentUser.set(null);
}
