<script lang="ts">
	function handleLogoutButton(): void {
		window.location.href = '/auth';
	}
</script>

<svelte:head>
	<title>CE Boostup XII Pointer</title>
</svelte:head>

<h1 class="text-4xl">Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<button
	class="mt-10 rounded border bg-gray-800 p-2 text-white hover:bg-gray-700"
	on:click={handleLogoutButton}
>
	Logout
</button>
