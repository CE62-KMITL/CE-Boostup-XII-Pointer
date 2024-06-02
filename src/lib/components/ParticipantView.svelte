<script lang="ts">
	import type { ParticipantGroupModel } from '$lib/interfaces/participant-model.interface';
	import { pocketbase } from '$lib/pocketbase';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { getInitial } from '$lib/get-initial.js';
	import type { GroupModel, GroupParticipantModel } from '$lib/interfaces/group-model.interface';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { toast } from 'svelte-sonner';

	let className: string = '';
	export { className as class };
	export let participant: ParticipantGroupModel | undefined;
	export let group: GroupParticipantModel | undefined;

	let scoreMode: 'per-person' | 'total' = 'per-person';
	let score: number = 0;

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
			success: 'Score updated!',
			error: (err) => {
				console.error(err);
				return `An error occured during score update: ${err instanceof Error ? err.message : 'Unknown error'}`;
			}
		});
	}
</script>

<div class={className}>
	{#if participant === undefined || group === undefined}
		<div class="flex">
			<div class="flex items-center space-x-4">
				<Skeleton class="h-14 w-14 rounded-full" />
				<div>
					<Skeleton class="my-1 h-4 w-28" />
					<Skeleton class="my-1 h-4 w-20" />
				</div>
			</div>
			<div class="ml-auto">
				<Skeleton class="my-1 ml-auto h-4 w-16" />
				<Skeleton class="h-10 w-32" />
			</div>
		</div>
	{:else}
		<div class="flex space-x-3">
			<div class="flex w-full items-center space-x-4">
				<Avatar.Root class="h-14 w-14">
					<Avatar.Image
						src={pocketbase.files.getUrl(group, group.avatar, {
							thumb: '128x128'
						})}
						alt="Avatar of {group.name}"
					/>
					<Avatar.Fallback>{getInitial(group.name)}</Avatar.Fallback>
				</Avatar.Root>
				<div class="w-0 flex-grow">
					<p class="overflow-hidden text-ellipsis text-nowrap text-base font-bold">
						สวัสดี{participant.name}
					</p>
					<p
						class="overflow-hidden text-ellipsis text-nowrap text-base font-medium text-gray-600 dark:text-gray-400"
					>
						บ้าน {group.name}
					</p>
				</div>
			</div>
			<Dialog.Root>
				<Dialog.Trigger class="ml-auto">
					<p class="text-end font-medium text-gray-600 dark:text-gray-400">คะแนน</p>
					<div class="h-10 w-32 rounded-lg bg-cprimary text-center">
						<p class="p-2 text-xl font-bold text-white">
							{participant.score.toLocaleString('en-US', { maximumFractionDigits: 2 })}
						</p>
					</div>
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>ให้คะแนน</Dialog.Title>
						<Dialog.Description>
							การให้คะแนนหลายคนมี 2 แบบคือ 1. ต่อคน ทุกคนที่เลือกจะได้คะแนนเท่าที่ใส่ไป 2. ทั้งหมด
							ทุกคนที่เลือกจะได้คะแนนรวมกันเท่าที่ใส่ไป โดยจะให้เท่ากันทุกคน
						</Dialog.Description>
					</Dialog.Header>
					<div class="my-4 grid grid-cols-4 items-center gap-4">
						<Label for="scoreDeduction" class="text-right">คะแนน</Label>
						<Input
							id="scoreDeduction"
							type="number"
							pattern="[0-9]*"
							min="0"
							inputmode="numeric"
							bind:value={score}
							class="col-span-3"
						/>
					</div>
					<RadioGroup.Root bind:value={scoreMode} class="flex justify-center space-x-8">
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="per-person" id="per-person" />
							<Label for="per-person">ต่อคน</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value="total" id="total" />
							<Label for="total">ทั้งหมด</Label>
						</div>
					</RadioGroup.Root>
					<div class="flex justify-between">
						<div class="w-full min-w-0 space-y-3">
							{#each group.expand.participants_via_group.toSorted((a, b) => {
								if (a.id === participant.id) return -1;
								if (b.id === participant.id) return 1;
								return a.name.localeCompare(b.name, 'en-US');
							}) as participant}
								<div class="flex items-center space-x-2">
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
									/>
									<Label
										for={`checkbox-${participant.id}`}
										class="w-0 flex-grow overflow-hidden text-ellipsis text-nowrap"
										>{participant.name} ({participant.fullName})</Label
									>
								</div>
							{/each}
						</div>
						<div class="flex-shrink-0 pl-2">
							{#if selectedParticipantIds.length === group.expand.participants_via_group.length}
								<Button
									variant="outline"
									on:click={() => {
										selectedParticipantIds = [participant.id];
									}}
									class="w-24">Reset</Button
								>
							{:else}
								<Button
									variant="outline"
									on:click={() => {
										selectedParticipantIds = group.expand.participants_via_group.map((p) => p.id);
									}}
									class="w-24">Select all</Button
								>
							{/if}
						</div>
					</div>
					<Dialog.Footer>
						<Dialog.Close class="mx-auto w-fit">
							<Button type="submit" on:click={updateScore}>Save changes</Button>
						</Dialog.Close>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/if}
</div>
