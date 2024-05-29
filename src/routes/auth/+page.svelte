<script lang="ts">
	import PocketBase from 'pocketbase';

	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

	const pb = new PocketBase(PUBLIC_POCKETBASE_URL);

	async function login(form: HTMLFormElement): Promise<void> {
		try {
			await pb.collection('users').authWithOAuth2({ provider: 'google' });
			form.token.value = pb.authStore.token;
			form.submit();
		} catch (err) {
			console.error(err);
		}
	}

	async function handleLoginFormSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	): Promise<void> {
		login(event.currentTarget);
	}
</script>

<form method="post" on:submit|preventDefault={handleLoginFormSubmit}>
	<input name="token" type="hidden" />
	<button class="mt-10 rounded border bg-gray-800 p-2 text-white hover:bg-gray-700">
		Login using Google
	</button>
</form>
