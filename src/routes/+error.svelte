<script lang="ts">
	import { TriangleAlert } from 'lucide-svelte';

	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>{`CE Boostup XII - ${$page.status} ${$page.error?.message ?? 'Unknown error'}`}</title>
</svelte:head>

<div class="mt-20 text-center">
	<div class="mb-8 flex justify-center">
		<TriangleAlert size={192} />
	</div>
	<h1 class="mb-4 text-6xl font-extrabold">{$page.status}</h1>
	<h2 class="text-2xl font-semibold">{$page.error?.message ?? 'Unknown error'}</h2>
</div>
