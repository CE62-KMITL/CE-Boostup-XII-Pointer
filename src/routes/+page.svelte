<script lang="ts">
	import { pocketbase } from '$lib/pocketbase.js';

	export let data;

	console.log(pocketbase.authStore.model);
</script>

<svelte:head>
	<title>CE Boostup XII Pointer</title>
</svelte:head>

{#if data.user}
	<h1 class="text-4xl">Welcome to SvelteKit {data.user.name} &lt;{data.user.email}&gt;!</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
	<img src={pocketbase.files.getUrl(data.user, data.user.avatar)} alt="Avatar" />
	<form action="/logout" method="post">
		<button type="submit" class="mt-10 rounded border bg-gray-800 p-2 text-white hover:bg-gray-700">
			Logout
		</button>
	</form>
{:else}
	<h1 class="text-4xl">Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
	<a href="/login">
		<button class="mt-10 rounded border bg-gray-800 p-2 text-white hover:bg-gray-700">
			Login
		</button>
	</a>
{/if}
