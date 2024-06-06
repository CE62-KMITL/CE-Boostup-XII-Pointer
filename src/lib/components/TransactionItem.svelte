<script lang="ts">
	import { ArrowDown, ArrowUp, CircleHelp, Gift } from 'lucide-svelte';

	import { format } from '$lib/format-number';
	import type { ParticipantModel } from '$lib/interfaces/participant-model.interface';
	import type { TransactionExpandedModel } from '$lib/interfaces/transaction-model.interface';

	let className: string = '';
	export { className as class };
	export let transaction: TransactionExpandedModel;
	export let participant: ParticipantModel;
</script>

<div class={className}>
	<div
		class="flex w-full items-center justify-between rounded-lg p-2 hover:bg-slate-50 hover:dark:bg-slate-900"
	>
		<div class="flex w-full items-center">
			<div
				class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900"
			>
				{#if transaction.action === 'add'}
					<ArrowUp color="#25BC16" />
				{:else if transaction.action === 'subtract'}
					<ArrowDown color="#FA695E" />
				{:else if transaction.action === 'reward'}
					<Gift color="#DA8ADC" />
				{:else}
					<CircleHelp color="#ACACAC" />
				{/if}
			</div>
			<div class="flex w-0 flex-grow flex-col justify-center">
				<p class="text-xs text-slate-800 dark:text-slate-400">
					{new Date(transaction.created).toLocaleString('th-TH', {
						dateStyle: 'medium',
						timeStyle: 'medium'
					})}
				</p>
				<p class="w-full min-w-0 overflow-hidden text-ellipsis text-nowrap">
					{transaction.expand.user.nickname}
					{transaction.action === 'add'
						? 'เพิ่มคะแนน'
						: transaction.action === 'subtract'
							? 'หักคะแนน'
							: 'ให้ของรางวัล'}
					{transaction.targetType === 'group' ? 'บ้าน ' + transaction.expand.group.name : ''}
					{#if transaction.targetType === 'participant'}
						{#if transaction.participant === participant.id}
							<strong class="font-medium text-fuchsia-500 dark:text-fuchsia-400"
								>{transaction.expand.participant.name}</strong
							>
						{:else}
							{transaction.expand.participant.name}
						{/if}
					{/if}
					{transaction.action === 'reward' ? ': ' + transaction.expand.item.name : ''}
				</p>
			</div>
		</div>
		<div class="flex items-center">
			{#if transaction.action === 'add'}
				<p class="font-medium text-green-600">{format(transaction.score)}</p>
			{:else if transaction.action === 'subtract'}
				<p class="font-medium text-red-400">{format(transaction.score)}</p>
			{/if}
		</div>
	</div>
</div>
