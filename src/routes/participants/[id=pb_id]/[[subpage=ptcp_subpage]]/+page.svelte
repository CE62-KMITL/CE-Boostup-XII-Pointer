<script lang="ts">
	import { Mutex } from 'async-mutex';
	import type { RecordSubscription, SendOptions } from 'pocketbase';
	import { onDestroy, onMount } from 'svelte';
	import { quartOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import AddScorePage from '$lib/components/AddScorePage.svelte';
	import BattlePassView from '$lib/components/BattlePassView.svelte';
	import ErrorPage from '$lib/components/ErrorPage.svelte';
	import GroupView from '$lib/components/GroupView.svelte';
	import ParticipantCreatePage from '$lib/components/ParticipantCreatePage.svelte';
	import ParticipantView from '$lib/components/ParticipantView.svelte';
	import StaffMenu from '$lib/components/StaffMenu.svelte';
	import SubtractScorePage from '$lib/components/SubtractScorePage.svelte';
	import TransactionPage from '$lib/components/TransactionPage.svelte';
	import type { ItemModel } from '$lib/interfaces/item-model.interface.js';
	import type { GroupModel, GroupParticipantModel } from '$lib/interfaces/group-model.interface.js';
	import type { GroupScoreModel } from '$lib/interfaces/group-score.interface.js';
	import type {
		ParticipantGroupModel,
		ParticipantModel
	} from '$lib/interfaces/participant-model.interface.js';
	import type { TransactionExpandedModel } from '$lib/interfaces/transaction-model.interface.js';
	import { pocketbase, currentUser } from '$lib/pocketbase';

	export let data;

	const mutex = new Mutex();

	let title = data.title;

	let participant: ParticipantModel | null = data.participant;
	let group: GroupModel | undefined = data.group;
	let groupScore: number | undefined = data.groupScore?.score;
	let items: ItemModel[] | undefined = data.items;
	let groupExpanded: GroupParticipantModel | undefined = undefined;
	let groups: GroupModel[] | undefined = undefined;
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

	$: $currentUser, clientLoad();

	async function clientLoad(): Promise<void> {
		if (!browser || $currentUser === undefined) return;
		const release = await mutex.acquire();
		try {
			unsubscribes.forEach((unsubscribe) => {
				try {
					unsubscribe();
				} catch (err) {
					console.error(err);
				}
			});
			unsubscribes = [];
			const subscriptionPromises: Promise<void>[] = [];
			if (participant === null) {
				if ($currentUser) {
					title = 'CE Boostup XII - Add Participant';
				} else {
					title = 'CE Boostup XII - 404 Not Found';
				}
				if ($currentUser) {
					try {
						groups = await pocketbase.collection('groups').getFullList<GroupModel>();
						const groupsSubscriptionPromise = subscribe<GroupModel>(
							'groups',
							'*',
							({ action, record }) => {
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
							}
						);
						subscriptionPromises.push(groupsSubscriptionPromise);
					} catch (err) {
						console.error(err);
					}
					try {
						const participantsSubscriptionPromise = subscribe<ParticipantGroupModel>(
							'participants',
							'*',
							({ action, record }) => {
								if (action === 'create' && record.id === data.id) {
									participant = record;
									group = record.expand.group;
									updateGroupScore(group.id);
									clientLoad();
								}
							},
							{
								expand: 'group'
							}
						);
						subscriptionPromises.push(participantsSubscriptionPromise);
					} catch (err) {
						console.error(err);
					}
				}
				return;
			}
			if (!group) {
				group = await pocketbase.collection('groups').getOne<GroupModel>(participant.group);
			}
			const participantsSubscriptionPromise = subscribe<ParticipantModel>(
				'participants',
				participant.id,
				({ action, record }) => {
					switch (action) {
						case 'update':
							participant = record;
							break;
						case 'delete':
							participant = null;
							clientLoad();
							break;
					}
				}
			);
			const itemsSubscriptionPromise = subscribe<ItemModel>('items', '*', ({ action, record }) => {
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
			subscriptionPromises.push(participantsSubscriptionPromise, itemsSubscriptionPromise);
			if ($currentUser) {
				try {
					groupExpanded = await pocketbase
						.collection('groups')
						.getOne<GroupParticipantModel>(group.id, {
							expand: 'participants_via_group'
						});
					const groupsSubscriptionPromise = subscribe<GroupParticipantModel>(
						'groups',
						group.id,
						({ action, record }) => {
							if (action === 'update') {
								group = record;
								groupExpanded = record;
							}
							updateGroupScore(group?.id);
						},
						{
							expand: 'participants_via_group'
						}
					);
					subscriptionPromises.push(groupsSubscriptionPromise);
				} catch (err) {
					console.error(err);
				}
				try {
					transactions = (
						await pocketbase.collection('transactions').getList<TransactionExpandedModel>(0, 500, {
							expand: 'user, participant, group, item',
							sort: '-created',
							filter: `participant="${participant.id}"||participant.group="${group.id}"||group="${group.id}"`
						})
					).items;
					const transactionsSubscriptionPromise = subscribe<TransactionExpandedModel>(
						'transactions',
						'*',
						({ action, record }) => {
							if (
								record.targetType === 'participant' &&
								!groupExpanded?.expand?.participants_via_group?.find(
									(p) => p.id === record.participant
								)
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
					subscriptionPromises.push(transactionsSubscriptionPromise);
				} catch (err) {
					console.error(err);
				}
			} else {
				const groupsSubscriptionPromise = subscribe<GroupParticipantModel>(
					'groups',
					group.id,
					({ action, record }) => {
						switch (action) {
							case 'update':
								group = record;
								updateGroupScore(group?.id);
								break;
							case 'delete':
								group = undefined;
								clientLoad();
								break;
						}
					}
				);
				subscriptionPromises.push(groupsSubscriptionPromise);
			}
			await Promise.allSettled(subscriptionPromises);
		} finally {
			release();
		}
	}

	onMount(() => {
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
	});

	onDestroy(() => {
		unsubscribes.forEach((unsubscribe) => unsubscribe());
	});
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="grid">
	{#if $currentUser && $page.state.subpage && participant && group && groupExpanded}
		<div
			class="col-start-1 col-end-2 row-start-1 row-end-2"
			transition:fly={{ duration: 250, x: '100%', easing: quartOut, opacity: 1 }}
		>
			{#if $page.state.subpage === 'add-score'}
				<AddScorePage {participant} group={groupExpanded} />
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
				<ParticipantCreatePage id={data.id} {groups} />
			{:else}
				<ErrorPage status={404} message={'Not Found'} class="mt-14" />
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
