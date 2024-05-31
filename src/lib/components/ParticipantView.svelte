<script lang="ts">
	import type { ParticipantModel } from "$lib/interfaces/participant-model.interface";
    import { pocketbase } from "$lib/pocketbase";
    import * as Avatar from '$lib/components/ui/avatar';
	import { getInitial } from '$lib/get-initial.js';

    let className: string = '';
    export { className as class };
    export let participant: ParticipantModel;
</script>

<div class={className}>
    <div class="flex">
        <div class="flex space-x-4 items-center">
            <Avatar.Root class="w-14 h-14">
                <Avatar.Image
                
                    src={pocketbase.files.getUrl(participant.expand.group, participant.expand.group.avatar, {
                        thumb: '128x128'
                    })}
                    alt="Avatar of {participant.expand.group.name}"
                />
                <Avatar.Fallback>{getInitial(participant.expand.group.name)}</Avatar.Fallback>
            </Avatar.Root>
            <div>
                <p class="font-bold text-base">สวัสดี{participant.name}</p>
                <p class="text-gray-600 dark:text-gray-400 text-base font-medium">บ้าน {participant.expand.group.name}</p>
            </div>
        </div>
        <div class="ml-auto">
            <p class="font-medium text-gray-600 dark:text-gray-400 text-end">คะแนน</p>
            <div class="flex justify-center items-center w-36 h-10 rounded-lg bg-green-700">
                <p class="text-white font-bold text-xl">{participant.score.toLocaleString("en-US")}</p>
            </div>
        </div>
    </div>
</div>