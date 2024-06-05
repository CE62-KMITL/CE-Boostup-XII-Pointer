<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { format } from '$lib/format-number';
	import { getInitial } from '$lib/get-initial.js';
	import type { GroupModel } from '$lib/interfaces/group-model.interface';
	import type { ParticipantModel } from '$lib/interfaces/participant-model.interface';
	import { pocketbase } from '$lib/pocketbase';

	let className: string = '';
	export { className as class };
	export let participant: ParticipantModel | undefined;
	export let group: GroupModel | undefined;
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
					<p class="overflow-hidden text-ellipsis text-nowrap pt-1 text-base font-bold">
						สวัสดี{participant.name}
					</p>
					<p
						class="overflow-hidden text-ellipsis text-nowrap text-base font-medium text-gray-600 dark:text-gray-400"
					>
						บ้าน {group.name}
					</p>
				</div>
			</div>
			<div class="ml-auto">
				<p class="text-end font-medium text-gray-600 dark:text-gray-400">คะแนน</p>
				<div class="h-10 w-32 rounded-lg bg-cprimary text-center">
					<p class="p-2 text-xl font-bold text-white dark:text-black">
						{format(participant.score)}
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
