<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import BattlePassView from '$lib/components/BattlePassView.svelte';
	import GroupView from '$lib/components/GroupView.svelte';
	import ParticipantView from '$lib/components/ParticipantView.svelte';
	import type { GroupModel } from '$lib/interfaces/group-model.interface.js';
	import type { ParticipantModel } from '$lib/interfaces/participant-model.interface.js';
	import { pocketbase } from '$lib/pocketbase';

	export let data;

	let participant: ParticipantModel | undefined = undefined;
	let group: GroupModel | undefined = undefined;
	let groupScore: number | undefined = undefined;

	let unsubscribes: (() => void)[] = [];

	async function updateGroupScore(groupId?: string): Promise<void> {
		if (groupId === undefined) return;
		groupScore = ((await pocketbase.collection('groupScores').getOne(groupId)) as { score: number })
			.score;
	}

	onMount(async () => {
		participant = (await pocketbase.collection('participants').getOne(data.id, {
			expand: 'group'
		})) as ParticipantModel;
		group = participant.expand.group;
		updateGroupScore(group.id);
		const participantsUnsubscribe = await pocketbase
			.collection('participants')
			.subscribe<ParticipantModel>(participant.id, ({ action, record }) => {
				if (action === 'update') {
					participant = record;
				}
				updateGroupScore(group?.id);
			});
		unsubscribes.push(participantsUnsubscribe);
		const groupUnsubscribe = await pocketbase
			.collection('groups')
			.subscribe<GroupModel>(group.id, ({ action, record }) => {
				if (action === 'update') {
					group = record;
				}
				updateGroupScore(group?.id);
			});
		unsubscribes.push(groupUnsubscribe);
	});

	onDestroy(() => {
		unsubscribes.forEach((unsubscribe) => unsubscribe());
	});
</script>

{#if participant === undefined || group === undefined}
	<p>Loading...</p>
{:else}
	<ParticipantView {participant} {group} class="m-4" />
	<GroupView {group} {groupScore} class="m-4" />
	<BattlePassView {participant} class="m-4" />
{/if}
