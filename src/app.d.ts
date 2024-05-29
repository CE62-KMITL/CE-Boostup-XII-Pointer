// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import Pocketbase from 'pocketbase';

import type { UserAuthModel } from '$lib/interfaces/userAuthModel.interface';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pocketbase: Pocketbase;
			user: UserAuthModel | undefined;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
