import PocketBase from 'pocketbase';
import { writable, type Writable } from 'svelte/store';
import { toast } from 'svelte-sonner';

import { type UserAuthModel } from './interfaces/user-auth-model.interface';

import { browser } from '$app/environment';
import { PUBLIC_POCKETBASE_URL, PUBLIC_LOCAL_POCKETBASE_URL } from '$env/static/public';

export const pocketbase: PocketBase = browser
	? new PocketBase(PUBLIC_POCKETBASE_URL)
	: new PocketBase(PUBLIC_LOCAL_POCKETBASE_URL);

export const currentUser: Writable<UserAuthModel | null | undefined> = browser
	? writable<UserAuthModel | null | undefined>(undefined, function start(set) {
			const unsubscribe = pocketbase.authStore.onChange((): void => {
				set((pocketbase.authStore.model ?? null) as UserAuthModel | null);
			});
			return function stop(): void {
				unsubscribe();
			};
		})
	: writable<UserAuthModel | null | undefined>(null);

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
		currentUser.set(pocketbase.authStore.model as UserAuthModel | null);
	} catch (err) {
		console.error(err);
		pocketbase.authStore.clear();
		currentUser.set(pocketbase.authStore.model as UserAuthModel | null);
		setTimeout(() => {
			toast.warning('Your session has expired', {
				description: 'Please log in again'
			});
		}, 1000);
	}
}

if (browser) {
	if (pocketbase.authStore.isValid) {
		refresh();
	} else {
		pocketbase.authStore.clear();
		currentUser.set(pocketbase.authStore.model as UserAuthModel | null);
	}
} else {
	pocketbase.autoCancellation(false);
}
