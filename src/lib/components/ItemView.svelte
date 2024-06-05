<script lang="ts">
	import { toast } from 'svelte-sonner';

	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Progress } from '$lib/components/ui/progress';
	import { format } from '$lib/format-number';
	import type { ItemModel } from '$lib/interfaces/ItemModel.interface';
	import type { ParticipantModel } from '$lib/interfaces/participant-model.interface';
	import type { UserAuthModel } from '$lib/interfaces/user-auth-model.interface';
	import { pocketbase, currentUser } from '$lib/pocketbase';
	import { cn } from '$lib/utils';

	let className: string = '';
	export { className as class };
	export let item: ItemModel;
	export let participant: ParticipantModel;

	$: itemStatus = participant.itemsUnlocked.includes(item.id)
		? 'claimed'
		: participant.score >= item.cost
			? 'finished'
			: 'in-progress';
	$: itemStatusText =
		itemStatus === 'claimed'
			? 'รับของแล้ว'
			: itemStatus === 'finished'
				? 'สำเร็จแล้ว'
				: 'ยังไม่สำเร็จ';

	function markItemAsClaimed(): void {
		const markItemAsClaimedPromise = pocketbase.collection('participants').update(participant.id, {
			'itemsUnlocked+': item.id
		});
		toast.promise(markItemAsClaimedPromise, {
			loading: 'Updating data...',
			success: () => {
				const user = $currentUser as UserAuthModel;
				pocketbase.collection('transactions').create({
					user: user.id,
					targetType: 'participant',
					participant: participant.id,
					action: 'reward',
					item: item.id
				});
				return 'Item marked as claimed!';
			},
			error: (err) => {
				console.error(err);
				return `An error occured during item update: ${err instanceof Error ? err.message : 'Unknown error'}`;
			}
		});
	}
</script>

<div class={className}>
	<div class="flex bg-gray-50 dark:bg-gray-900">
		<Dialog.Root>
			<Dialog.Trigger class="w-full min-w-0 flex-grow p-3 pt-2 text-left sm:mr-4">
				<p class="w-full overflow-hidden text-ellipsis text-nowrap pt-1 text-base font-medium">
					{item.name}
				</p>
				<p class={cn('text-sm font-medium transition-all duration-500', itemStatus + '-score')}>
					{format(participant.score)} / {format(item.cost)}
				</p>
				<Progress
					aria-label="Progress"
					value={participant.score / item.cost}
					max={1}
					class="h-3 w-auto border-2 border-gray-300 bg-gray-300 dark:border-gray-700 dark:bg-gray-700"
					subClass={cn('rounded-full duration-500', itemStatus + '-progress')}
				/>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>{item.name}</Dialog.Title>
					<Dialog.Description>
						{item.description}
					</Dialog.Description>
				</Dialog.Header>
				<img src={pocketbase.files.getUrl(item, item.image)} alt="Preview image for {item.name}" />
			</Dialog.Content>
		</Dialog.Root>
		<div
			class="flex w-[90px] flex-shrink-0 flex-col items-center justify-center border-l border-gray-400 p-3 sm:w-[122px] sm:px-4"
		>
			{#if $currentUser}
				{#if itemStatus === 'finished'}
					<AlertDialog.Root>
						<AlertDialog.Trigger
							><Button
								class="h-8 w-[4.5rem] bg-cprimary px-2 text-xs hover:bg-cprimary sm:w-20 sm:text-sm"
								>รับของ</Button
							></AlertDialog.Trigger
						>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
								<AlertDialog.Description>
									This action cannot be undone. Well it actually can be there's just no button for
									it yet.
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action on:click={markItemAsClaimed}>Continue</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				{:else if itemStatus === 'in-progress'}
					<Button class="h-8 w-[4.5rem] px-2 text-xs sm:w-20 sm:text-sm" disabled
						>ยังไม่สำเร็จ</Button
					>
				{:else}
					<p
						class={cn('mb-1 text-sm font-medium transition-all duration-500', itemStatus + '-text')}
					>
						{itemStatusText}
					</p>
				{/if}
			{:else}
				<p class={cn('mb-1 text-sm font-medium transition-all duration-500', itemStatus + '-text')}>
					{itemStatusText}
				</p>
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	.in-progress-score {
		@apply text-red-400 dark:text-red-500;
	}
	.finished-score {
		@apply text-csecondary;
	}
	.claimed-score {
		@apply text-green-600;
	}
	.in-progress-text {
		@apply text-gray-500 dark:text-gray-400;
	}
	.finished-text {
		@apply text-csecondary;
	}
	.claimed-text {
		@apply text-green-600;
	}
</style>
