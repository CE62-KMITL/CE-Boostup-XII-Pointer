import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

import { type UserAuthModel } from './interfaces/userAuthModel.interface';

// import { PUBLIC_POCKETBASE_URL } from '$env/static/public';  // TODO: Re-enable this

export const pocketbase = new PocketBase('https://pointer.ceboostup.com/pocketbase');

export const currentUser = writable(pocketbase.authStore.model as UserAuthModel);

pocketbase.authStore.onChange(() => {
	currentUser.set(pocketbase.authStore.model as UserAuthModel);
});
