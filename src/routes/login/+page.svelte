<script lang="ts">
	import PocketBase from 'pocketbase';
	import Cookies from 'js-cookie';
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

	const pocketbase = new PocketBase(PUBLIC_POCKETBASE_URL);

	async function login(): Promise<void> {
		try {
			const data = await pocketbase.collection('users').authWithOAuth2({ provider: 'google' });
			const meta = data.meta;

			if (meta && meta.isNew) {
				const formData = new FormData();

				if (meta.name) {
					formData.append('name', meta.name);
				}

				if (meta.avatarUrl) {
					const avatarResponse = await fetch(meta.avatarUrl);
					if (avatarResponse.ok) {
						formData.append('avatar', await avatarResponse.blob());
					}
				}

				await pocketbase.collection('users').update(data.record.id, formData);
			}

			Cookies.set(
				'pb_auth',
				JSON.stringify({ token: pocketbase.authStore.token, model: pocketbase.authStore.model }),
				{
					path: '/',
					secure: true,
					sameSite: 'strict'
				}
			);
		} catch (err) {
			console.error(err);
			// TODO: Add toast or something
		}
	}
</script>

<button on:click={login} class="mt-10 rounded border bg-gray-800 p-2 text-white hover:bg-gray-700">
	Login with Google
</button>
