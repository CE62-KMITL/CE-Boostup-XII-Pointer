<script lang="ts">
	import { Mutex } from 'async-mutex';
	import type { RecordSubscription, SendOptions } from 'pocketbase';
	import { onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import ErrorPage from '$lib/components/ErrorPage.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { format } from '$lib/format-number.js';
	import { getInitial } from '$lib/get-initial.js';
	import type { GroupParticipantModel } from '$lib/interfaces/group-model.interface';
	import type { GroupScoreModel } from '$lib/interfaces/group-score.interface.js';
	import { currentUser, pocketbase } from '$lib/pocketbase';
	import { ChevronLeft } from 'lucide-svelte';

	export let data;

	const mutex = new Mutex();

	const animationDuration = 400;

	let group: GroupParticipantModel | undefined = undefined;

	$: participants = group ? (group.expand ? group.expand.participants_via_group : []) : undefined;

	$: maxScore =
		participants?.reduce((acc, participant) => Math.max(acc, participant.score), 0) ?? 0;

	let groupScore: number | undefined = undefined;

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
			if ($currentUser) {
				group = await pocketbase.collection('groups').getOne<GroupParticipantModel>(data.id, {
					expand: 'participants_via_group'
				});
				updateGroupScore(group.id);
				const groupSubscriptionPromise = subscribe<GroupParticipantModel>(
					'groups',
					data.id,
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
				subscriptionPromises.push(groupSubscriptionPromise);
			}
			await Promise.allSettled(subscriptionPromises);
		} finally {
			release();
		}
	}

	onDestroy(() => {
		unsubscribes.forEach((unsubscribe) => unsubscribe());
	});
</script>

{#if $currentUser}
	<div class="flex items-center justify-between">
		<a
			href={`${base}/`}
			class="flex-shrink-0 rounded-lg px-4 py-2 hover:bg-accent hover:text-accent-foreground"
		>
			<div class="flex items-center">
				<ChevronLeft class="mr-1.5" /><span class="text-base font-medium">กลับ</span>
			</div>
		</a>
		<h3 class="flex-shrink-0 text-lg font-bold">Leaderboard</h3>
		<div class="w-[87.63px]" />
	</div>
	{#if group === undefined || groupScore === undefined}
		<div class="mx-5 my-4 flex">
			<div class="flex items-center space-x-4">
				<Skeleton class="h-14 w-14 rounded-full" />
				<div>
					<Skeleton class="my-1 h-4 w-24" />
				</div>
			</div>
			<div class="ml-auto">
				<Skeleton class="my-1 ml-auto h-4 w-16" />
				<Skeleton class="h-10 w-32" />
			</div>
		</div>
	{:else}
		<div class="mx-5 my-4 flex space-x-3">
			<div class="flex w-full items-center space-x-4">
				<Avatar.Root class="h-14 w-14">
					<Avatar.Image
						src={pocketbase.files.getUrl(group, group.avatar, {
							thumb: '128x128'
						})}
						alt="Avatar of {group.name}"
					/>
					<Avatar.Fallback class="text-3xl">{getInitial(group.name)}</Avatar.Fallback>
				</Avatar.Root>
				<div class="w-0 flex-grow">
					<p class="overflow-hidden text-ellipsis text-nowrap pt-1 text-base font-bold">
						บ้าน {group.name}
					</p>
				</div>
			</div>
			<div class="ml-auto">
				<p class="text-end font-medium text-slate-600 dark:text-slate-400">คะแนนบ้าน</p>
				<div class="h-10 w-32 rounded-lg bg-cprimary text-center">
					<p class="p-2 text-xl font-bold text-white dark:text-black">
						{format(groupScore)}
					</p>
				</div>
			</div>
		</div>
	{/if}
	{#if participants}
		<div class="mx-5 space-y-2">
			{#each participants.toSorted((a, b) => b.score - a.score) as participant (participant.id)}
				<a
					href={`${base}/participants/${participant.id}`}
					class="relative flex h-11 w-full items-center overflow-hidden rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-900"
					animate:flip={{ duration: animationDuration }}
					in:fade={{ duration: animationDuration }}
					out:fade={{ duration: animationDuration }}
				>
					<div class="z-20 flex w-0 flex-grow items-center">
						<p
							class="ml-3 w-0 flex-grow overflow-hidden text-ellipsis text-nowrap pt-1 text-base font-medium"
						>
							{participant.name} ({participant.fullName})
						</p>
					</div>
					<div class="z-20 flex flex-shrink-0 items-center">
						<p class="text-base font-medium">{format(participant.score)}</p>
					</div>
					<div
						style="width: {maxScore !== 0 ? (participant.score / maxScore) * 100 : 0}%;"
						class="absolute bottom-0 left-0 top-0 z-10 rounded-lg bg-slate-200 transition-all duration-500 dark:bg-slate-800"
					></div>
				</a>
			{:else}
				<p class="text-center pt-1">ไม่มีน้องในกลุ่มนี้</p>
			{/each}
		</div>
	{:else}
		<div class="mx-5 space-y-2">
			{#each Array(8) as _}
				<Skeleton class="h-11 w-full" />
			{/each}
		</div>
	{/if}
{:else}
	<ErrorPage status={404} message={'Not Found'} class="mt-14" />
{/if}
