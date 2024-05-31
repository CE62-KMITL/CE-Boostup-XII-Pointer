import PocketBase from 'pocketbase';
import { readable } from 'svelte/store';
import { toast } from 'svelte-sonner';

import { type UserAuthModel } from './interfaces/userAuthModel.interface';

import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export const pocketbase = new PocketBase(PUBLIC_POCKETBASE_URL);

export const currentUser = readable<UserAuthModel | undefined>(
	pocketbase.authStore.model as UserAuthModel | undefined,
	function start(set) {
		const unsubscribe = pocketbase.authStore.onChange((): void => {
			set(pocketbase.authStore.model as UserAuthModel | undefined);
		});
		return function stop(): void {
			unsubscribe();
		};
	}
);

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

if (pocketbase.authStore.isValid) {
	refresh();
} else {
	pocketbase.authStore.clear();
}
