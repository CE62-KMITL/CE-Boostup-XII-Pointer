import PocketBase from 'pocketbase';

import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

export const pocketbase = new PocketBase(PUBLIC_POCKETBASE_URL);
