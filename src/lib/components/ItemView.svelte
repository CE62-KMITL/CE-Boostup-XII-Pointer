<script lang="ts">
	import type { ItemModel } from "$lib/interfaces/ItemModel.interface";
	import type { ParticipantModel } from "$lib/interfaces/participant-model.interface";
    import { Progress } from "$lib/components/ui/progress";

    let className: string = '';
    export { className as class };
    export let item: ItemModel;
    export let participant: ParticipantModel;
</script>

<div class={className}>
    <div class="flex bg-gray-50 dark:bg-gray-900">
        <div class="flex-grow flex-shrink w-full min-w-0 p-3">
            <p class="text-base font-medium text-ellipsis text-nowrap overflow-hidden w-full">{item.name}</p>
            {#if participant.itemsUnlocked.includes(item.id)}
                <p class="text-sm font-medium text-gray-500">{participant.score} / {item.cost}</p>
                <Progress value={participant.score/item.cost*100} class="h-3 w-auto bg-gray-300 border-gray-300 dark:bg-gray-700 dark:border-gray-700 border-2" subClass="rounded-full bg-gray-500" />
            {:else if participant.score >= item.cost}
                <p class="text-sm font-medium text-yellow-500">{participant.score} / {item.cost}</p>
                <Progress value={participant.score/item.cost*100} class="h-3 w-auto bg-gray-300 border-gray-300 dark:bg-gray-700 dark:border-gray-700 border-2" subClass="rounded-full bg-yellow-500" />
            {:else}
                <p class="text-sm font-medium text-green-600">{participant.score} / {item.cost}</p>
                <Progress value={participant.score/item.cost*100} class="h-3 w-auto bg-gray-300 border-gray-300 dark:bg-gray-700 dark:border-gray-700 border-2" subClass="rounded-full bg-green-600" />
            {/if}
        </div>
        <div class="border-l border-gray-400 w-32 flex justify-center items-center p-3">
            <p class="font-medium text-sm">
            {#if participant.itemsUnlocked.includes(item.id)}
                <p class="text-green-600">รับของแล้ว</p>
            {:else if participant.score >= item.cost}
                <p>สำเร็จแล้ว</p>
            {:else}
                <p class="text-gray-500 dark:text-gray-400">ยังไม่สำเร็จ</p>
            {/if}
            </p>
        </div>
    </div>
</div>
