<script lang="ts">
	import { Mutex } from 'async-mutex';
	import { Scan, X } from 'lucide-svelte';
	import type { RecordSubscription, SendOptions } from 'pocketbase';
	import QrScanner from 'qr-scanner';
	import { onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { toast } from 'svelte-sonner';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { navigating } from '$app/stores';
	import { PUBLIC_ORIGIN } from '$env/static/public';
	import ErrorPage from '$lib/components/ErrorPage.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
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
			const subscriptionPromises: Promise<void>[] = [];
			if ($currentUser) {
				groups = await pocketbase.collection('groups').getFullList<GroupModel>();
				updateGroupsScore();
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
						updateGroupsScore();
					}
				);
				subscriptionPromises.push(groupsSubscriptionPromise);
				hasCamera = await QrScanner.hasCamera();
				if (videoElement) {
					qrScanner = new QrScanner(
						videoElement,
						(result) => {
							if (result.data.startsWith(PUBLIC_ORIGIN) && !$navigating) {
								const navigatePromise = goto(result.data);
								toast.promise(navigatePromise, {
									loading: 'Redirecting...',
									success: 'Redirected successfully!',
									error: (err) => {
										console.error(err);
										return `An error occured during redirection: ${
											err instanceof Error ? err.message : 'Unknown error'
										}`;
									}
								});
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
			await Promise.allSettled(subscriptionPromises);
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
		{#if scanning}
			<div class="mx-5 my-4">
				<Button
					on:click={() => {
						scanning = false;
						qrScanner?.stop();
					}}
					class="w-full bg-red-600 hover:bg-red-600 dark:bg-red-500 hover:dark:bg-red-500"
					><X class="mr-2" />Stop Scanning</Button
				>
			</div>
		{:else}
			<div class="mx-5 my-4">
				<Button
					on:click={() => {
						scanning = true;
						qrScanner?.start();
					}}
					class="w-full bg-cprimary hover:bg-cprimary"><Scan class="mr-2" />Scan QR Code</Button
				>
			</div>
		{/if}
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
				<a
					href={`${base}/groups/${group.id}`}
					class="relative flex w-full items-center overflow-hidden rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-900"
					animate:flip={{ duration: animationDuration }}
					in:fade={{ duration: animationDuration }}
					out:fade={{ duration: animationDuration }}
				>
					<div class="z-20 flex w-0 flex-grow items-center">
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
					<div class="z-20 flex flex-shrink-0 items-center">
						<p class="text-base font-medium">{format(group.score)}</p>
					</div>
					<div
						style="width: {maxScore !== 0 ? (group.score / maxScore) * 100 : 0}%;"
						class="absolute bottom-0 left-0 top-0 z-10 rounded-lg bg-slate-200 transition-all duration-500 dark:bg-slate-800"
					></div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="mx-5 space-y-2">
			{#each Array(6) as _}
				<Skeleton class="h-14 w-full" />
			{/each}
		</div>
	{/if}
{:else}
	<ErrorPage status={404} message={'Not Found'} class="mt-14" />
{/if}
