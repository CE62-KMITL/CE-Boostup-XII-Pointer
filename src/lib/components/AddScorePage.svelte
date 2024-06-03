<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, Info } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import type { GroupParticipantModel } from '$lib/interfaces/group-model.interface';
	import type { ParticipantGroupModel } from '$lib/interfaces/participant-model.interface';
	import * as Dialog from '$lib/components/ui/dialog';
	import { toast } from 'svelte-sonner';
	import { pocketbase } from '$lib/pocketbase';
	import { cn } from '$lib/utils';

	let className: string = '';
	export { className as class };
	export let subpage: Writable<'add-score' | 'subtract-score' | 'transaction' | undefined>;
	export let participant: ParticipantGroupModel | undefined;
	export let group: GroupParticipantModel | undefined;

	let scoreMode: 'per-person' | 'total' = 'per-person';
	let score: number | undefined = undefined;

	$: score = score === undefined ? undefined : score >= 0 ? score : 0;

	let selectedParticipantIds: string[] = [];
	let setInitialSelectedParticipantIds = false;

	$: {
		if (participant && !setInitialSelectedParticipantIds) {
			selectedParticipantIds = [participant.id];
			setInitialSelectedParticipantIds = true;
		}
	}

	async function updateScore() {
		if (selectedParticipantIds.length === 0 || !score) {
			toast.warning('Score not updated', {
				description: 'No changes to apply'
			});
			return;
		}
		if (scoreMode === 'total') {
			score = score / selectedParticipantIds.length;
		}
		const updateScorePromise = Promise.all(
			selectedParticipantIds.map(async (id) => {
				await pocketbase.collection('participants').update(id, {
					'score+': score
				});
			})
		);
		score = 0;
		toast.promise(updateScorePromise, {
			loading: 'Updating score...',
			success: () => {
				$subpage = undefined;
				return 'Score updated!';
			},
			error: (err) => {
				console.error(err);
				$subpage = undefined;
				return `An error occured during score update: ${err instanceof Error ? err.message : 'Unknown error'}`;
			}
		});
	}
</script>

<div class={className}>
	<div class="flex items-center justify-between">
		<Button
			on:click={() => {
				$subpage = undefined;
			}}
			variant="ghost"
			class="flex-shrink-0"
		>
			<div class="flex items-center">
				<ChevronLeft class="mr-1.5" /><span class="text-base font-medium">กลับ</span>
			</div>
		</Button>
		<h3 class="flex-shrink-0 text-lg font-bold">เพิ่มคะแนน</h3>
		<div class="w-[87.63px]" />
	</div>
	<div class="mx-5 my-4">
		<Label class="text-lg font-bold">กรอกคะแนน</Label>
		<Input
			class="mt-2 border border-gray-700 text-base placeholder:text-base placeholder:font-medium placeholder:text-gray-400"
			type="number"
			pattern="[0-9]*"
			min="0"
			inputmode="numeric"
			placeholder="กรอกตัวเลข"
			bind:value={score}
		/>
		<Label class="mt-8 flex items-center text-lg font-bold">
			ลักษณะการให้คะแนน
			<Dialog.Root>
				<Dialog.Trigger class="ml-2"><Info class="h-5 w-5" /></Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>ลักษณะการให้คะแนน</Dialog.Title>
					</Dialog.Header>
					<div>การให้คะแนนรายบุคคลคือการให้คะแนนทุกคนที่เลือกตามจำนวนตัวเลขที่กรอก</div>
					<div>
						การให้คะแนนบ้าน (หาร) คือ การให้คะแนนทุกคน ที่เลือกโดยผ่านการหารแล้วจากตัวเลขที่กรอกและ
						จำนวนคนที่เลือก
					</div>
				</Dialog.Content>
			</Dialog.Root>
		</Label>
		<RadioGroup.Root bind:value={scoreMode} class="mt-2 flex space-x-6">
			<div class="flex items-center space-x-2">
				<RadioGroup.Item
					value="per-person"
					id="per-person"
					class="border-cprimary text-cprimary"
					subClass="w-3 h-3"
				/>
				<Label for="per-person" class="cursor-pointer text-base font-medium">คะแนนรายบุคคล</Label>
			</div>
			<div class="flex items-center space-x-2">
				<RadioGroup.Item
					value="total"
					id="total"
					class="border-cprimary text-cprimary"
					subClass="w-3 h-3"
				/>
				<Label for="total" class="cursor-pointer text-base font-medium">คะแนนบ้าน (หาร)</Label>
			</div>
		</RadioGroup.Root>
		<div class="flex justify-between">
			<Label class="mb-0.5 mt-8 block text-lg font-bold">สมาชิกที่จะให้คะแนน</Label>
			{#if group && participant}
				{#if selectedParticipantIds.length === group.expand.participants_via_group.length}
					<Button
						variant="ghost"
						on:click={() => {
							selectedParticipantIds = [];
						}}
						class="mt-6 w-24 p-0 text-base font-medium text-red-400">ยกเลิกทั้งหมด</Button
					>
				{:else}
					<Button
						variant="ghost"
						on:click={() => {
							selectedParticipantIds = group.expand.participants_via_group.map((p) => p.id);
						}}
						class="mt-6 w-24 p-0 text-base font-medium text-cprimary">เลือกทั้งหมด</Button
					>
				{/if}
			{/if}
		</div>
		{#if group && participant}
			<div class="flex w-full min-w-0 flex-col space-y-2">
				{#each group.expand.participants_via_group.toSorted((a, b) => {
					if (a.id === participant.id) return -1;
					if (b.id === participant.id) return 1;
					return a.name.localeCompare(b.name, 'en-US');
				}) as participant}
					<div
						class={cn(
							'flex w-full min-w-0 items-center space-x-2 rounded-sm px-2',
							selectedParticipantIds.includes(participant.id) ? 'selected' : ''
						)}
					>
						<Checkbox
							checked={selectedParticipantIds.includes(participant.id)}
							value={participant.id}
							id={`checkbox-${participant.id}`}
							onCheckedChange={(v) => {
								if (v) {
									selectedParticipantIds = [...selectedParticipantIds, participant.id];
								} else {
									selectedParticipantIds = selectedParticipantIds.filter(
										(id) => id !== participant.id
									);
								}
							}}
							class="border-cprimary p-0.5 text-xl data-[state=checked]:bg-[hsl(var(--cprimary))]"
						/>
						<div class="flex w-full justify-between">
							<Label
								for={`checkbox-${participant.id}`}
								class="w-0 flex-grow cursor-pointer overflow-hidden text-ellipsis text-nowrap py-1 text-base font-medium"
								>{participant.name} ({participant.fullName})</Label
							>
							<Label
								for={`checkbox-${participant.id}`}
								class="ml-2 w-fit flex-shrink-0 py-1 text-base font-medium text-green-600"
							>
								{#if selectedParticipantIds.includes(participant.id)}
									+
									{#if scoreMode === 'per-person'}
										{(+(score ?? 0)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
									{:else}
										{((score ?? 0) / selectedParticipantIds.length).toLocaleString('en-US', {
											maximumFractionDigits: 2
										})}
									{/if}
								{/if}
							</Label>
						</div>
					</div>
				{/each}
			</div>
		{/if}
		<Button type="submit" on:click={updateScore} class="mt-8 w-full bg-cprimary hover:bg-cprimary"
			>บันทึก</Button
		>
	</div>
</div>

<style lang="postcss">
	.selected {
		@apply bg-gray-50 dark:bg-gray-900;
	}
</style>
