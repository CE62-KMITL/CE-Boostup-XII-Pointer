import PocketBase from 'pocketbase';
import { writable, type Writable } from 'svelte/store';
import { toast } from 'svelte-sonner';

import { type UserAuthModel } from './interfaces/userAuthModel.interface';

// import { PUBLIC_POCKETBASE_URL } from '$env/static/public';  // TODO: Re-enable this

export const pocketbase = new PocketBase('https://pointer.ceboostup.com/pocketbase'); // TODO: Use PUBLIC_POCKETBASE_URL

export const currentUser: Writable<UserAuthModel | undefined> = writable(
	pocketbase.authStore.model as UserAuthModel | undefined
);

pocketbase.authStore.onChange((): void => {
	currentUser.set(pocketbase.authStore.model as UserAuthModel | undefined);
});

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
