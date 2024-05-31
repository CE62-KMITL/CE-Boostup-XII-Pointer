<script lang="ts">
	import type { ParticipantModel } from '$lib/interfaces/participant-model.interface.js';
	import { currentUser, pocketbase } from '$lib/pocketbase';
	import ParticipantView from '$lib/components/ParticipantView.svelte';
	import GroupView from '$lib/components/GroupView.svelte';
	import BattlePassView from '$lib/components/BattlePassView.svelte';
	import type { ItemModel } from '$lib/interfaces/ItemModel.interface.js';

	export let data;

	const participant = pocketbase.collection('participants').getOne(data.id, {
		expand: 'group,itemsUnlocked'
	}) as Promise<ParticipantModel>;

	const items = pocketbase.collection('items').getFullList({ sort: 'cost' }) as Promise<
		ItemModel[]
	>;
</script>

{#await participant}
	<p>Loading...</p>
{:then participant}
	<ParticipantView {participant} class="m-4" />
	<GroupView group={participant.expand.group} class="m-4" />
	<BattlePassView {participant} {items} class="m-4" />
{:catch error}
	{#if $currentUser}
		<p>Participant not found. INSERT Create participant component</p>
	{:else}
		<p>Participant not found.</p>
	{/if}
{/await}
