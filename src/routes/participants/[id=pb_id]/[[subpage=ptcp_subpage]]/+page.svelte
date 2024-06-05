<script lang="ts">
	// @hmr:keep-all

	import { TriangleAlert } from 'lucide-svelte';
	import type { RecordSubscription, SendOptions } from 'pocketbase';
	import { onDestroy, onMount } from 'svelte';
	import { quartOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import AddScorePage from '$lib/components/AddScorePage.svelte';
	import BattlePassView from '$lib/components/BattlePassView.svelte';
	import GroupView from '$lib/components/GroupView.svelte';
	import ParticipantCreatePage from '$lib/components/ParticipantCreatePage.svelte';
	import ParticipantView from '$lib/components/ParticipantView.svelte';
	import StaffMenu from '$lib/components/StaffMenu.svelte';
	import SubtractScorePage from '$lib/components/SubtractScorePage.svelte';
	import TransactionPage from '$lib/components/TransactionPage.svelte';
	import type { ItemModel } from '$lib/interfaces/ItemModel.interface.js';
	import type { GroupModel, GroupParticipantModel } from '$lib/interfaces/group-model.interface.js';
	import type { GroupScoreModel } from '$lib/interfaces/group-score.interface.js';
	import type { ParticipantGroupModel } from '$lib/interfaces/participant-model.interface.js';
	import type { TransactionExpandedModel } from '$lib/interfaces/transaction-model.interface.js';
	import { pocketbase, currentUser } from '$lib/pocketbase';

	export let data;

	let title = 'CE Boostup XII - Participant';

	let participant: ParticipantGroupModel | undefined | null = undefined;
	let group: GroupParticipantModel | undefined = undefined;
	let groupScore: number | undefined = undefined;
	let groups: GroupModel[] | undefined = undefined;
	let items: ItemModel[] | undefined = undefined;
	let transactions: TransactionExpandedModel[] | undefined = undefined;

	let unsubscribes: (() => void)[] = [];

	async function updateGroupScore(groupId?: string): Promise<void> {
		if (groupId === undefined) return;
		groupScore = (await pocketbase.collection('groupScores').getOne<GroupScoreModel>(groupId))
			.score;
	}

	async function subscribe<T>(
		collection: string,
		id: string,
		callback: (data: RecordSubscription<T>) => void,
		options?: SendOptions
	): Promise<void> {
		const unsubscribe = await pocketbase.collection(collection).subscribe<T>(id, callback, options);
		unsubscribes.push(unsubscribe);
	}

	let firstRun = true;
	let reactiveFirstRun = true;

	$: if (browser) {
		init(!$currentUser && false && reactiveFirstRun);
		reactiveFirstRun = false;
	}

	async function init(firstRunOnly: boolean = false): Promise<void> {
		if ($currentUser === undefined) {
			return;
		}
		if (firstRunOnly && !firstRun) {
			return;
		}
		firstRun = false;
		unsubscribes.forEach((unsubscribe) => {
			try {
				unsubscribe();
			} catch (err) {
				console.error(err);
			}
		});
		unsubscribes = [];
		const itemsPromise = pocketbase.collection('items').getFullList<ItemModel>();
		try {
			participant = await pocketbase
				.collection('participants')
				.getOne<ParticipantGroupModel>(data.id, {
					expand: 'group'
				});
			title = `CE Boostup XII - ${participant.name} - บ้าน ${participant.expand.group.name}`;
			group = participant.expand.group as GroupParticipantModel;
			updateGroupScore(group.id);
			subscribe<ParticipantGroupModel>('participants', participant.id, ({ action, record }) => {
				if (action === 'update') {
					participant = record;
				}
			});
			items = await itemsPromise;
			if ($currentUser) {
				try {
					group = await pocketbase.collection('groups').getOne<GroupParticipantModel>(group.id, {
						expand: 'participants_via_group'
					});
					subscribe<GroupParticipantModel>(
						'groups',
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
				} catch (err) {
					console.error(err);
					subscribe<GroupParticipantModel>('groups', group.id, ({ action, record }) => {
						if (action === 'update') {
							group = record;
						}
						updateGroupScore(group?.id);
					});
				}
				try {
					transactions = (
						await pocketbase.collection('transactions').getList<TransactionExpandedModel>(0, 500, {
							expand: 'user, participant, group, item',
							sort: '-created',
							filter: `participant="${participant.id}"||participant.group="${group.id}"||group="${group.id}"`
						})
					).items;
					subscribe<TransactionExpandedModel>(
						'transactions',
						'*',
						({ action, record }) => {
							if (
								record.targetType === 'participant' &&
								!group?.expand?.participants_via_group?.find((p) => p.id === record.participant)
							) {
								return;
							}
							if (record.targetType === 'group' && record.group !== group?.id) {
								return;
							}
							switch (action) {
								case 'create':
									transactions = transactions ? [record, ...transactions] : [record];
									break;
								case 'update': {
									const index = transactions?.findIndex(
										(transaction) => transaction.id === record.id
									);
									if (index !== undefined && transactions && index !== -1) {
										transactions[index] = record;
									}
									break;
								}
								case 'delete':
									transactions = transactions?.filter(
										(transaction) => transaction.id !== record.id
									);
									break;
							}
						},
						{
							expand: 'user, participant, group, item'
						}
					);
				} catch (err) {
					console.error(err);
				}
			} else {
				subscribe<GroupParticipantModel>('groups', group.id, ({ action, record }) => {
					if (action === 'update') {
						group = record;
					}
					updateGroupScore(group?.id);
				});
			}
		} catch (err) {
			participant = null;
			if ($currentUser) {
				title = 'CE Boostup XII - Add Participant';
			} else {
				title = 'CE Boostup XII - 404 Not Found';
			}
			if ($currentUser) {
				try {
					groups = await pocketbase.collection('groups').getFullList<GroupModel>();
					subscribe<GroupModel>('groups', '*', ({ action, record }) => {
						switch (action) {
							case 'create':
								groups = groups ? [...groups, record] : [record];
								break;
							case 'update': {
								const index = groups?.findIndex((group) => group.id === record.id);
								if (index !== undefined && groups && index !== -1) {
									groups[index] = record;
								}
								break;
							}
							case 'delete':
								groups = groups?.filter((group) => group.id !== record.id);
								break;
						}
					});
				} catch (err) {
					console.error(err);
				}
			}
			items = await itemsPromise;
		}
		subscribe<ItemModel>('items', '*', ({ action, record }) => {
			switch (action) {
				case 'create':
					items = items ? [...items, record] : [record];
					break;
				case 'update': {
					const index = items?.findIndex((item) => item.id === record.id);
					if (index !== undefined && items && index !== -1) {
						items[index] = record;
					}
					break;
				}
				case 'delete':
					items = items?.filter((item) => item.id !== record.id);
					break;
			}
		});
	}

	onMount(async () => {
		if (data.subpage) {
			if ($currentUser) {
				setTimeout(() => {
					replaceState('', { subpage: data.subpage });
				}, 0);
			} else {
				setTimeout(() => {
					replaceState('.', { subpage: undefined });
				}, 0);
			}
		}
		init(true);
	});

	onDestroy(() => {
		unsubscribes.forEach((unsubscribe) => unsubscribe());
	});
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="grid">
	{#if $page.state.subpage && participant && group && group.expand?.participants_via_group && $currentUser}
		<div
			class="col-start-1 col-end-2 row-start-1 row-end-2"
			transition:fly={{ duration: 250, x: '100%', easing: quartOut, opacity: 1 }}
		>
			{#if $page.state.subpage === 'add-score'}
				<AddScorePage {participant} {group} />
			{:else if $page.state.subpage === 'subtract-score'}
				<SubtractScorePage {group} />
			{:else if $page.state.subpage === 'transaction'}
				<TransactionPage {transactions} {participant} />
			{/if}
		</div>
	{:else if participant === null}
		<div
			class="col-start-1 col-end-2 row-start-1 row-end-2"
			transition:fly={{ duration: 250, x: '100%', easing: quartOut, opacity: 1 }}
		>
			{#if $currentUser}
				<ParticipantCreatePage
					id={data.id}
					{groups}
					on:created={() => {
						init();
					}}
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
		</div>
	{:else}
		<div
			class="col-start-1 col-end-2 row-start-1 row-end-2"
			transition:fly={{ duration: 250, x: '-100%', easing: quartOut, opacity: 1 }}
		>
			<ParticipantView {participant} {group} class="mx-5 mb-4" />
			<GroupView {group} {groupScore} class="mx-5 my-5" />
			<BattlePassView {participant} {items} class="mx-5 mb-4 mt-6" />
			{#if $currentUser}
				<StaffMenu class="mx-5 mb-4 mt-6" />
			{/if}
		</div>
	{/if}
</div>
