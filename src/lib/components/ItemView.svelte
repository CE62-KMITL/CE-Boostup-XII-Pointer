<script lang="ts">
	import type { ItemModel } from "$lib/interfaces/ItemModel.interface";
	import type { ParticipantModel } from "$lib/interfaces/participant-model.interface";
    import { Progress } from "$lib/components/ui/progress";
	import { cn } from "$lib/utils";

    let className: string = '';
    export { className as class };
    export let item: ItemModel;
    export let participant: ParticipantModel;

    $: itemStatus = participant.itemsUnlocked.includes(item.id) ? 'claimed' : participant.score >= item.cost ? 'finished' : 'in-progress';
    $: itemStatusText = itemStatus === 'claimed' ? 'รับของแล้ว' : itemStatus === 'finished' ? 'สำเร็จแล้ว' : 'ยังไม่สำเร็จ';
</script>

<div class={className}>
    <div class="flex bg-gray-50 dark:bg-gray-900">
        <div class="flex-grow flex-shrink w-full min-w-0 p-3">
            <p class="text-base font-medium text-ellipsis text-nowrap overflow-hidden w-full">{item.name}</p>
            <p class={cn("text-sm font-medium transition-all duration-500", itemStatus + '-score')}>{participant.score.toLocaleString('en-US', { maximumFractionDigits: 2})} / {item.cost.toLocaleString('en-US', { maximumFractionDigits: 2})}</p>
            <Progress value={participant.score/item.cost} max={1} class="h-3 w-auto bg-gray-300 border-gray-300 dark:bg-gray-700 dark:border-gray-700 border-2" subClass={cn("rounded-full duration-500", itemStatus + '-progress')} />
        </div>
        <div class="border-l border-gray-400 w-32 flex justify-center items-center p-3">
            <p class={cn("font-medium text-sm transition-all duration-500", itemStatus + '-text')}>{itemStatusText}</p>
        </div>
    </div>
</div>

<style lang="postcss">
    .in-progress-score {
        @apply text-green-600;
    }
    .finished-score {
        @apply text-yellow-500;
    }
    .claimed-score {
        @apply text-gray-500;
    }
    .in-progress-text {
        @apply text-gray-500 dark:text-gray-400;
    }
    .claimed-text {
        @apply text-green-600;
    }
</style>
