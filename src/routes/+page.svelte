<script lang="ts">
	import type { UserAuthModel } from '$lib/interfaces/userAuthModel.interface';
	import { pocketbase } from '$lib/pocketbase.js';

	const user = pocketbase.authStore.model as UserAuthModel | undefined;

	async function logout(): Promise<void> {
		pocketbase.authStore.clear();
	}
</script>

<svelte:head>
	<title>CE Boostup XII Pointer</title>
</svelte:head>

{#if user}
	<h1 class="text-4xl">Welcome to SvelteKit {user.name} &lt;{user.email}&gt;!</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
	<img src={pocketbase.files.getUrl(user, user.avatar)} alt="Avatar" />
	<button
		on:click={logout}
		class="mt-10 rounded border bg-gray-800 p-2 text-white hover:bg-gray-700"
	>
		Logout
	</button>
{:else}
	<h1 class="text-4xl">Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
	<a href="/login">
		<button class="mt-10 rounded border bg-gray-800 p-2 text-white hover:bg-gray-700">
			Login
		</button>
	</a>
{/if}
