<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	import ItemView from './ItemView.svelte';

	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { ItemModel } from '$lib/interfaces/ItemModel.interface';
	import type { ParticipantModel } from '$lib/interfaces/participant-model.interface';

	const animationDuration = 400;

	let className: string = '';
	export { className as class };
	export let participant: ParticipantModel | undefined;
	export let items: ItemModel[] | undefined;

	let sortedItems: ItemModel[] | undefined;

	$: sortedItems = items?.toSorted((a, b) => {
		if (participant?.itemsUnlocked.includes(a.id) && participant?.itemsUnlocked.includes(b.id)) {
			return a.cost - b.cost;
		}
		if (participant?.itemsUnlocked.includes(a.id)) {
			return 1;
		}
		if (participant?.itemsUnlocked.includes(b.id)) {
			return -1;
		}
		return a.cost - b.cost;
	});
</script>

<div class={className}>
	{#if participant === undefined || sortedItems === undefined}
		<Skeleton class="mb-4 mt-6 h-5 w-40" />
		{#each Array(5) as _}
			<Skeleton class="mt-2 h-20" />
		{/each}
	{:else}
		<p class="text-lg font-bold">Battle Pass ส่วนตัว</p>
		{#each sortedItems as item (item.id)}
			<div
				animate:flip={{ duration: animationDuration }}
				in:fade={{ duration: animationDuration }}
				out:fade={{ duration: animationDuration }}
			>
				<ItemView {participant} {item} class="mt-2 overflow-hidden rounded-lg drop-shadow-md" />
			</div>
		{/each}
	{/if}
</div>
