<script lang="ts">
	import { currentUser } from '$lib/pocketbase';
</script>

<svelte:head>
	<title>CE Boostup XII Pointer</title>
</svelte:head>

{#if $currentUser}
	<h1 class="text-wrap text-2xl">
		Logged in as {$currentUser.name} &lt;{$currentUser.email}&gt;!
	</h1>
{:else}
	<h1 class="text-2xl">Not logged in</h1>
{/if}
