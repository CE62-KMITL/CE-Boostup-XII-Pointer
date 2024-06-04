// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			subpage: 'add-score' | 'subtract-score' | 'transaction' | undefined;
		}
		// interface Platform {}
	}
}

export {};
