<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft } from 'lucide-svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { swipe } from 'svelte-gestures';
	import type { TransactionExpandedModel } from '$lib/interfaces/transaction-model.interface';
	import TransactionItem from '$lib/components/TransactionItem.svelte';
	import { fade, fly } from 'svelte/transition';
	import { quadOut, quintOut } from 'svelte/easing';
	import { flip } from 'svelte/animate';
	import type { ParticipantModel } from '$lib/interfaces/participant-model.interface';

	const animationDuration = 400;

	let className: string = '';
	export { className as class };
	export let transactions: TransactionExpandedModel[] | undefined;
	export let participant: ParticipantModel;

	let tabSelected = false;
</script>

<div
	class={className}
	use:swipe={{ timeframe: 300, minSwipeDistance: 60, touchAction: 'pan-y' }}
	on:swipe={(event) => {
		if (event.detail.direction !== 'right') return;
		pushState('.', { subpage: undefined });
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
		<Tabs.Root value="account">
			<Tabs.List class="flex justify-around">
				<Tabs.Trigger
					on:click={() => {
						tabSelected = true;
					}}
					value="add-score"
					class="w-28 flex-grow hover:bg-gray-200 hover:dark:bg-gray-700">เพิ่มคะแนน</Tabs.Trigger
				>
				<Tabs.Trigger
					on:click={() => {
						tabSelected = true;
					}}
					value="subtract-score"
					class="w-28 flex-grow hover:bg-gray-200 hover:dark:bg-gray-700">หักคะแนนบ้าน</Tabs.Trigger
				>
				<Tabs.Trigger
					on:click={() => {
						tabSelected = true;
					}}
					value="items"
					class="w-28 flex-grow hover:bg-gray-200 hover:dark:bg-gray-700">รับของรางวัล</Tabs.Trigger
				>
			</Tabs.List>
			<Tabs.Content value="add-score">
				<div class="mt-4 divide-y divide-gray-300">
					{#if transactions}
						{#each transactions.filter((t) => t.action === 'add') as transaction (transaction.id)}
							<div
								animate:flip={{ duration: animationDuration }}
								in:fade={{ duration: animationDuration }}
								out:fade={{ duration: animationDuration }}
							>
								<TransactionItem {transaction} {participant} />
							</div>
						{/each}
					{/if}
				</div>
			</Tabs.Content>
			<Tabs.Content value="subtract-score"
				><div class="mt-4 divide-y divide-gray-300">
					{#if transactions}
						{#each transactions.filter((t) => t.action === 'subtract') as transaction (transaction.id)}
							<div
								animate:flip={{ duration: animationDuration }}
								in:fade={{ duration: animationDuration }}
								out:fade={{ duration: animationDuration }}
							>
								<TransactionItem {transaction} {participant} />
							</div>
						{/each}
					{/if}
				</div></Tabs.Content
			>
			<Tabs.Content value="items"
				><div class="mt-4 divide-y divide-gray-300">
					{#if transactions}
						{#each transactions.filter((t) => t.action === 'reward') as transaction (transaction.id)}
							<div
								animate:flip={{ duration: animationDuration }}
								in:fade={{ duration: animationDuration }}
								out:fade={{ duration: animationDuration }}
							>
								<TransactionItem {transaction} {participant} />
							</div>
						{/each}
					{/if}
				</div></Tabs.Content
			>
		</Tabs.Root>
		{#if !tabSelected && transactions}
			<div class="mt-4 divide-y divide-gray-300">
				{#each transactions as transaction (transaction.id)}
					<div
						animate:flip={{ duration: animationDuration }}
						in:fade={{ duration: animationDuration }}
						out:fade={{ duration: animationDuration }}
					>
						<TransactionItem {transaction} {participant} />
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
