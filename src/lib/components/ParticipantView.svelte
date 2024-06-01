<script lang="ts">
	import type { ParticipantModel } from "$lib/interfaces/participant-model.interface";
    import { pocketbase } from "$lib/pocketbase";
    import * as Avatar from '$lib/components/ui/avatar';
    import { Skeleton } from "$lib/components/ui/skeleton";
	import { getInitial } from '$lib/get-initial.js';
	import type { GroupModel } from "$lib/interfaces/group-model.interface";

    let className: string = '';
    export { className as class };
    export let participant: ParticipantModel | undefined;
    export let group: GroupModel | undefined;
</script>

<div class={className}>
    {#if participant === undefined || group === undefined}
        <div class="flex">
            <div class="flex space-x-4 items-center">
                <Skeleton class="w-14 h-14 rounded-full" />
                <div>
                    <Skeleton class="w-28 h-4 my-1" />
                    <Skeleton class="w-20 h-4 my-1" />
                </div>
            </div>
            <div class="ml-auto">
                <Skeleton class="w-16 h-4 my-1 ml-auto" />
                <Skeleton class="w-32 h-10" />
            </div>
        </div>
    {:else}
        <div class="flex">
            <div class="flex space-x-4 items-center">
                <Avatar.Root class="w-14 h-14">
                    <Avatar.Image
                        src={pocketbase.files.getUrl(group, group.avatar, {
                            thumb: '128x128'
                        })}
                        alt="Avatar of {group.name}"
                    />
                    <Avatar.Fallback>{getInitial(group.name)}</Avatar.Fallback>
                </Avatar.Root>
                <div>
                    <p class="font-bold text-base">สวัสดี{participant.name}</p>
                    <p class="text-gray-600 dark:text-gray-400 text-base font-medium">บ้าน {group.name}</p>
                </div>
            </div>
            <div class="ml-auto">
                <p class="font-medium text-gray-600 dark:text-gray-400 text-end">คะแนน</p>
                <div class="text-center w-32 h-10 rounded-lg bg-cprimary">
                    <p class="text-white font-bold text-xl p-2">{participant.score.toLocaleString("en-US", { maximumFractionDigits: 2})}</p>
                </div>
            </div>
        </div>
    {/if}
</div>