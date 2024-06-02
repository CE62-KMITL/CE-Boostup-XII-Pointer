<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import BattlePassView from '$lib/components/BattlePassView.svelte';
	import GroupView from '$lib/components/GroupView.svelte';
	import ParticipantView from '$lib/components/ParticipantView.svelte';
	import type { GroupModel, GroupParticipantModel } from '$lib/interfaces/group-model.interface.js';
	import type { GroupScoreModel } from '$lib/interfaces/group-score.interface.js';
	import type {
		ParticipantModel,
		ParticipantGroupModel
	} from '$lib/interfaces/participant-model.interface.js';
	import { pocketbase, currentUser } from '$lib/pocketbase';
	import ParticipantCreate from '$lib/components/ParticipantCreate.svelte';
	import { TriangleAlert } from 'lucide-svelte';

	export let data;

	let title = 'CE Boostup XII - Participant';

	let participant: ParticipantGroupModel | undefined | null = undefined;
	let group: GroupParticipantModel | undefined = undefined;
	let groupScore: number | undefined = undefined;

	let unsubscribes: (() => void)[] = [];

	async function updateGroupScore(groupId?: string): Promise<void> {
		if (groupId === undefined) return;
		groupScore = (await pocketbase.collection('groupScores').getOne<GroupScoreModel>(groupId))
			.score;
	}

	let mounted = false;
	let firstRun = true;

	$: if (mounted) {
		init(!$currentUser || true);
	}

	async function init(isReactive: boolean = false) {
		if (isReactive && firstRun) {
			firstRun = false;
			return;
		}
		unsubscribes.forEach((unsubscribe) => {
			try {
				unsubscribe();
			} catch (err) {
				console.error(err);
			}
		});
		unsubscribes = [];
		try {
			participant = await pocketbase
				.collection('participants')
				.getOne<ParticipantGroupModel>(data.id, {
					expand: 'group'
				});
		} catch (err) {
			participant = null;
			if ($currentUser) {
				title = 'CE Boostup XII - Add Participant';
			} else {
				title = 'CE Boostup XII - 404 Not Found';
			}
			return;
		}
		title = `CE Boostup XII - ${participant.name}`;
		group = participant.expand.group as GroupParticipantModel;
		updateGroupScore(group.id);
		if ($currentUser) {
			group = await pocketbase.collection('groups').getOne<GroupParticipantModel>(group.id, {
				expand: 'participants_via_group'
			});
		}
		const participantsUnsubscribe = await pocketbase
			.collection('participants')
			.subscribe<ParticipantGroupModel>(
				participant.id,
				({ action, record }) => {
					if (action === 'update') {
						participant = record;
					}
				},
				{
					expand: 'group'
				}
			);
		unsubscribes.push(participantsUnsubscribe);
		if ($currentUser) {
			const groupUnsubscribe = await pocketbase
				.collection('groups')
				.subscribe<GroupParticipantModel>(
					group.id,
					({ action, record }) => {
						if (action === 'update') {
							group = record;
						}
						updateGroupScore(group?.id);
					},
					{
						expand: 'participants_via_group'
					}
				);
			unsubscribes.push(groupUnsubscribe);
		} else {
			const groupUnsubscribe = await pocketbase
				.collection('groups')
				.subscribe<GroupParticipantModel>(group.id, ({ action, record }) => {
					if (action === 'update') {
						group = record;
					}
					updateGroupScore(group?.id);
				});
			unsubscribes.push(groupUnsubscribe);
		}
	}

	onMount(async () => {
		await init();
		mounted = true;
	});

	onDestroy(() => {
		unsubscribes.forEach((unsubscribe) => unsubscribe());
	});
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

{#if participant === null}
	{#if $currentUser}
		<ParticipantCreate
			id={data.id}
			on:created={() => {
				init();
			}}
			class="mx-5 my-4"
		/>
	{:else}
		<div class="mt-20 text-center">
			<div class="mb-8 flex justify-center">
				<TriangleAlert size={192} />
			</div>
			<h1 class="mb-4 text-6xl font-extrabold">404</h1>
			<h2 class="text-2xl font-semibold">Not found</h2>
		</div>
	{/if}
{:else}
	<ParticipantView {participant} {group} class="mx-5 my-4" />
	<GroupView {group} {groupScore} class="mx-5 my-4" />
	<BattlePassView {participant} class="mx-5 mb-4 mt-8" />
{/if}
