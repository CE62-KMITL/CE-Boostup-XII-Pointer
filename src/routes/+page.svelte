<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>CE Boostup XII Pointer</title>
</svelte:head>

{#if data.user}
	<h1 class="text-4xl">Welcome to SvelteKit {data.user.email}!</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
{:else}
	<h1 class="text-4xl">Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
{/if}
