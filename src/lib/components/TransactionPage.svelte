<script lang="ts">
	import { ChevronLeft } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { swipe } from 'svelte-gestures';

	import { pushState } from '$app/navigation';
	import TransactionItem from '$lib/components/TransactionItem.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { ParticipantModel } from '$lib/interfaces/participant-model.interface';
	import type { TransactionExpandedModel } from '$lib/interfaces/transaction-model.interface';

	const animationDuration = 400;

	const displayCountIncrease = 50;

	let className: string = '';
	export { className as class };
	export let transactions: TransactionExpandedModel[] | undefined;
	export let participant: ParticipantModel;

	let displayCount = 25;
	$: totalCount = transactions?.length ?? 0;

	$: slicedTransactions = transactions?.slice(0, displayCount) ?? [];

	let tabSelected: 'add' | 'subtract' | 'reward' | 'all' = 'all';
</script>

<div
	class={className}
	use:swipe={{ timeframe: 300, minSwipeDistance: 60, touchAction: 'pan-y' }}
	on:swipe={(event) => {
		switch (event.detail.direction) {
			case 'right':
				switch (tabSelected) {
					case 'add':
						tabSelected = 'all';
						break;
					case 'subtract':
						tabSelected = 'add';
						break;
					case 'reward':
						tabSelected = 'subtract';
						break;
					case 'all':
						pushState('.', { subpage: undefined });
						break;
				}
				break;

			case 'left':
				switch (tabSelected) {
					case 'add':
						tabSelected = 'subtract';
						break;
					case 'subtract':
						tabSelected = 'reward';
						break;
					case 'all':
						tabSelected = 'add';
						break;
				}
				break;
		}
	}}
>
	<div class="flex items-center justify-between">
		<Button
			on:click={() => {
				pushState('.', { subpage: undefined });
			}}
			variant="ghost"
			class="flex-shrink-0"
		>
			<div class="flex items-center">
				<ChevronLeft class="mr-1.5" /><span class="text-base font-medium">กลับ</span>
			</div>
		</Button>
		<h3 class="flex-shrink-0 text-lg font-bold">ดู Transaction</h3>
		<div class="w-[87.63px]" />
	</div>
	<div class="mx-5 my-4">
		<Tabs.Root bind:value={tabSelected}>
			<Tabs.List class="flex justify-around">
				<Tabs.Trigger value="add" class="w-28 flex-grow hover:bg-slate-50 hover:dark:bg-slate-900"
					>เพิ่มคะแนน</Tabs.Trigger
				>
				<Tabs.Trigger
					value="subtract"
					class="w-28 flex-grow hover:bg-slate-50 hover:dark:bg-slate-900"
					>หักคะแนนบ้าน</Tabs.Trigger
				>
				<Tabs.Trigger
					value="reward"
					class="w-28 flex-grow hover:bg-slate-50 hover:dark:bg-slate-900"
					>รับของรางวัล</Tabs.Trigger
				>
			</Tabs.List>
			<Tabs.Content value="all">
				<div class="mt-4 divide-y divide-slate-300">
					{#each slicedTransactions as transaction (transaction.id)}
						<div
							animate:flip={{ duration: animationDuration }}
							in:fade={{ duration: animationDuration }}
							out:fade={{ duration: animationDuration }}
						>
							<TransactionItem {transaction} {participant} />
						</div>
					{/each}
				</div>
			</Tabs.Content>
			<Tabs.Content value="add">
				<div class="mt-4 divide-y divide-slate-300">
					{#each slicedTransactions.filter((t) => t.action === 'add') as transaction (transaction.id)}
						<div
							animate:flip={{ duration: animationDuration }}
							in:fade={{ duration: animationDuration }}
							out:fade={{ duration: animationDuration }}
						>
							<TransactionItem {transaction} {participant} />
						</div>
					{/each}
				</div>
			</Tabs.Content>
			<Tabs.Content value="subtract"
				><div class="mt-4 divide-y divide-slate-300">
					{#each slicedTransactions.filter((t) => t.action === 'subtract') as transaction (transaction.id)}
						<div
							animate:flip={{ duration: animationDuration }}
							in:fade={{ duration: animationDuration }}
							out:fade={{ duration: animationDuration }}
						>
							<TransactionItem {transaction} {participant} />
						</div>
					{/each}
				</div>
			</Tabs.Content>
			<Tabs.Content value="reward"
				><div class="mt-4 divide-y divide-slate-300">
					{#each slicedTransactions.filter((t) => t.action === 'reward') as transaction (transaction.id)}
						<div
							animate:flip={{ duration: animationDuration }}
							in:fade={{ duration: animationDuration }}
							out:fade={{ duration: animationDuration }}
						>
							<TransactionItem {transaction} {participant} />
						</div>
					{/each}
				</div>
			</Tabs.Content>
		</Tabs.Root>
		{#if displayCount < totalCount}
			<Button
				on:click={() => {
					displayCount += displayCountIncrease;
				}}
				variant="secondary"
				class="mt-2 w-full">Load More</Button
			>
		{/if}
	</div>
</div>
