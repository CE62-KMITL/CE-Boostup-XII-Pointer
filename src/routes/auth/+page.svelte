<script lang="ts">
	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import PocketBase from 'pocketbase';

	const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

	async function login(form: HTMLFormElement) {
		try {
			await pb.collection('users').authWithOAuth2({ provider: 'google' });
			form.token.value = pb.authStore.token;
			form.submit();
		} catch (err) {
			console.error(err);
		}
	}
</script>

<form method="post" on:submit|preventDefault={(e) => login(e.currentTarget)}>
	<input name="token" type="hidden" />
	<button class="mt-10 rounded border bg-gray-800 p-2 text-white hover:bg-gray-700">
		Login using Google
	</button>
</form>
