<script lang="ts">
	import { Mutex } from 'async-mutex';
	import type { RecordSubscription, SendOptions } from 'pocketbase';
	import QrScanner from 'qr-scanner';
	import { onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import ErrorPage from '$lib/components/ErrorPage.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { format } from '$lib/format-number';
	import { getInitial } from '$lib/get-initial';
	import type { GroupExtendScoreModel, GroupModel } from '$lib/interfaces/group-model.interface';
	import type { GroupScoreModel } from '$lib/interfaces/group-score.interface';
	import { currentUser, pocketbase } from '$lib/pocketbase';

	const mutex = new Mutex();

	const animationDuration = 400;

	let groups: GroupModel[] | undefined = undefined;
	let groupsScore: GroupExtendScoreModel[] | undefined = undefined;

	let hasCamera = false;

	let videoElement: HTMLVideoElement | undefined = undefined;
	let qrScanner: QrScanner | undefined = undefined;
	let scanning = false;

	$: maxScore = groupsScore?.reduce((acc, group) => Math.max(acc, group.score), 0) ?? 0;

	let unsubscribes: (() => void)[] = [];

	async function updateGroupsScore(): Promise<void> {
		const scores = await pocketbase.collection('groupScores').getFullList<GroupScoreModel>();
		groupsScore = groups?.map((group) => {
			const score = scores?.find((groupScore) => groupScore.id === group.id)?.score ?? 0;
			return { ...group, score };
		});
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
			if ($currentUser) {
				groups = await pocketbase.collection('groups').getFullList<GroupModel>();
				updateGroupsScore();
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
					updateGroupsScore();
				});
				hasCamera = await QrScanner.hasCamera();
				if (videoElement) {
					qrScanner = new QrScanner(
						videoElement,
						(result) => {
							if (result.data.includes(PUBLIC_ORIGIN)) {
								goto(result.data);
							}
						},
						{
							maxScansPerSecond: 5,
							highlightScanRegion: true,
							highlightCodeOutline: true,
							returnDetailedScanResult: true
						}
					);
				}
			}
		} finally {
			release();
		}
	}

	onDestroy(() => {
		if (qrScanner) {
			qrScanner.destroy();
		}
		unsubscribes.forEach((unsubscribe) => unsubscribe());
	});
</script>

<svelte:head>
	<title>CE Boostup XII Pointer</title>
</svelte:head>

{#if $currentUser}
	{#if hasCamera}
		<div class="mx-5 my-4">
			<Button
				on:click={() => {
					scanning = !scanning;
					if (scanning) {
						qrScanner?.start();
					} else {
						qrScanner?.stop();
					}
				}}
				class="w-full bg-cprimary hover:bg-cprimary">Scan QR Code</Button
			>
		</div>
	{/if}
	<div class="mx-5 mb-4 flex justify-center">
		<div class="w-3/4 lg:w-1/2">
			<video
				bind:this={videoElement}
				height={scanning ? 'auto' : '0'}
				width={scanning ? '100%' : '0'}><track kind="captions" /></video
			>
		</div>
	</div>
	{#if scanning}
		<h3 class="mx-5 mb-4 mt-8 text-lg font-medium">Leadearboard</h3>
	{:else}
		<h3 class="mx-5 my-4 text-lg font-medium">Leadearboard</h3>
	{/if}
	{#if groupsScore}
		<div class="mx-5 space-y-2">
			{#each groupsScore.toSorted((a, b) => b.score - a.score) as group (group.id)}
				<div
					class="relative -z-20 flex w-full items-center overflow-hidden rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-900"
					animate:flip={{ duration: animationDuration }}
					in:fade={{ duration: animationDuration }}
					out:fade={{ duration: animationDuration }}
				>
					<div class="flex w-0 flex-grow items-center">
						<Avatar.Root class="h-10 w-10">
							<Avatar.Image
								src={pocketbase.files.getUrl(group, group.avatar, {
									thumb: '64x64'
								})}
								alt="Avatar of {group.name}"
							/>
							<Avatar.Fallback class="bg-slate-300 text-lg font-medium dark:bg-slate-700"
								>{getInitial(group.name)}</Avatar.Fallback
							>
						</Avatar.Root>
						<p
							class="ml-3 w-0 flex-grow overflow-hidden text-ellipsis text-nowrap pt-1 text-base font-medium"
						>
							{`บ้าน ${group.name}`}
						</p>
					</div>
					<div class="flex flex-shrink-0 items-center">
						<p class="text-base font-medium">{format(group.score)}</p>
					</div>
					<div
						style="width: {maxScore !== 0 ? (group.score / maxScore) * 100 : 0}%;"
						class="absolute bottom-0 left-0 top-0 -z-10 rounded-lg bg-slate-200 transition-all duration-500 dark:bg-slate-800"
					></div>
				</div>
			{/each}
		</div>
	{/if}
{:else}
	<ErrorPage status={404} message={'Not Found'} class="mt-14" />
{/if}
