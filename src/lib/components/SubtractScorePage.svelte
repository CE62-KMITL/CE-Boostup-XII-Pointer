<script lang="ts">
	import { ChevronLeft, Info } from 'lucide-svelte';
	import { swipe } from 'svelte-gestures';
	import { toast } from 'svelte-sonner';

	import { pushState } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { GroupModel } from '$lib/interfaces/group-model.interface';
	import type { UserAuthModel } from '$lib/interfaces/user-auth-model.interface';
	import { pocketbase, currentUser } from '$lib/pocketbase';

	let className: string = '';
	export { className as class };
	export let group: GroupModel;

	let score: string | undefined = undefined;

	function updateScore(): void {
		if (!score?.match(/^[0-9]+(\.[0-9]+)?$/)) {
			toast.error('Invalid score');
			return;
		}
		const parsedScore = score ? +score : 0;
		if (!parsedScore) {
			toast.warning('Score not updated', {
				description: 'No changes to apply'
			});
			return;
		}
		if (parsedScore < 0) {
			toast.error('Score must be a positive number');
			return;
		}
		const decrementPromise = pocketbase.collection('groups').update(group.id, {
			'scoreOffset-': parsedScore
		});
		toast.promise(decrementPromise, {
			loading: 'Updating score...',
			success: () => {
				const user = $currentUser as UserAuthModel;
				pocketbase.collection('transactions').create({
					user: user.id,
					targetType: 'group',
					group: group.id,
					action: 'subtract',
					score: parsedScore
				});
				score = '0';
				pushState('.', { subpage: undefined });
				return 'Score updated!';
			},
			error: (err) => {
				console.error(err);
				score = '0';
				pushState('.', { subpage: undefined });
				return `An error occured during score update: ${err instanceof Error ? err.message : 'Unknown error'}`;
			}
		});
	}
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
		<h3 class="flex-shrink-0 text-lg font-bold">หักคะแนนบ้าน</h3>
		<div class="w-[87.63px]" />
	</div>
	<form on:submit|preventDefault={updateScore} class="mx-5 my-4">
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
			min="0"
			inputmode="numeric"
			placeholder="กรอกตัวเลข"
			autofocus
			bind:value={score}
		/>
		<Button type="submit" class="mb-64 mt-8 w-full bg-cprimary hover:bg-cprimary">บันทึก</Button>
	</form>
</div>
