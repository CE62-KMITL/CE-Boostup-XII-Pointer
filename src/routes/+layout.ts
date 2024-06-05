import type { LayoutLoad } from './$types';

import { pocketbase } from '$lib/pocketbase';

export const load: LayoutLoad = async ({ fetch }) => {
	const methods = await pocketbase.collection('users').listAuthMethods({ fetch });
	const provider = methods.authProviders.find((provider) => provider.name === 'google');
	return { provider };
};
