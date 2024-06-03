<script lang="ts">
	import type { GroupParticipantModel } from '$lib/interfaces/group-model.interface';
	import type { Writable } from 'svelte/store';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, Info } from 'lucide-svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { toast } from 'svelte-sonner';
	import { pocketbase } from '$lib/pocketbase';
	import { getInitial } from '$lib/get-initial';

	let className: string = '';
	export { className as class };
	export let subpage: Writable<'add-score' | 'subtract-score' | 'transaction' | undefined>;
	export let group: GroupParticipantModel | undefined;

	let score: number | undefined = undefined;

	$: score = score === undefined ? undefined : score >= 0 ? score : 0;

	async function updateScore() {
		if (!group || !score) {
			toast.warning('Score not updated', {
				description: 'No changes to apply'
			});
			return;
		}
		const decrementPromise = pocketbase.collection('groups').update(group.id, {
			'scoreOffset-': score
		});
		score = 0;
		toast.promise(decrementPromise, {
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
		<h3 class="flex-shrink-0 text-lg font-bold">หักคะแนนบ้าน</h3>
		<div class="w-[87.63px]" />
	</div>
	<div class="mx-5 my-4">
		<Label class="flex items-center text-lg font-bold"
			>กรอกคะแนน<Dialog.Root>
				<Dialog.Trigger class="ml-2"><Info class="h-5 w-5" /></Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Header>
						<Dialog.Title>การหักคะแนนบ้าน</Dialog.Title>
					</Dialog.Header>
					<div>
						ในกรณีบ้านนั้น ๆ ซื้อของโดยใช้คะแนนในช่วงการเล่น กิจกรรม จะมีการหักคะแนนของบ้านแต่คะแนน
						ส่วนบุคคลของน้องจะไม่มีการเปลี่ยนแปลง
					</div>
				</Dialog.Content>
			</Dialog.Root></Label
		>
		<Input
			class="mt-2 border border-gray-700 text-base placeholder:text-base placeholder:font-medium placeholder:text-gray-400"
			type="number"
			pattern="[0-9]*"
			min="0"
			inputmode="numeric"
			placeholder="กรอกตัวเลข"
			bind:value={score}
		/>
		<!-- <div class="ml-4">
			{#if group}
				<div class="my-4 flex items-center space-x-4">
					<Avatar.Root class="h-14 w-14">
						<Avatar.Image
							src={pocketbase.files.getUrl(group, group.avatar, {
								thumb: '128x128'
							})}
							alt="Avatar of {group.name}"
						/>
						<Avatar.Fallback>{getInitial(group.name)}</Avatar.Fallback>
					</Avatar.Root>
					<div>
						<p class="overflow-hidden text-ellipsis text-nowrap text-lg font-bold">
							บ้าน {group.name}
						</p>
					</div>
				</div>
			{/if}
		</div> -->
		<Button type="submit" on:click={updateScore} class="mt-8 w-full bg-cprimary hover:bg-cprimary"
			>บันทึก</Button
		>
	</div>
</div>
