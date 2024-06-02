<script lang="ts">
	import type { ItemModel } from "$lib/interfaces/ItemModel.interface";
	import type { ParticipantModel } from "$lib/interfaces/participant-model.interface";
	import { pocketbase } from "$lib/pocketbase";
    import { Skeleton } from "$lib/components/ui/skeleton";
	import { onDestroy, onMount } from "svelte";
	import ItemView from "./ItemView.svelte";
    import { flip } from "svelte/animate";
	import { fade } from "svelte/transition";

    const animationDuration = 400;

    let className: string = '';
    export { className as class };
    export let participant: ParticipantModel | undefined;
    let items: ItemModel[] | undefined = undefined;

    const unsubscribes: (() => void)[] = [];

    onMount(async () => {
       items = await pocketbase.collection('items').getFullList<ItemModel>({ sort: 'cost' });
       const unsubscribe = await pocketbase.collection('items').subscribe<ItemModel>(
           '*',
           ({ action, record }) => {
                switch (action) {
                    case 'create':
                        items?.push(record);
                        items = items?.toSorted((a, b) => a.cost - b.cost)
                        break;
                    case 'update':
                        const index = items?.findIndex((item) => item.id === record.id);
                        if (index !== undefined && items && index !== -1) {
                            items[index] = record;
                        }
                        items = items?.toSorted((a, b) => a.cost - b.cost)
                        break;
                    case 'delete':
                        items = items?.filter((item) => item.id !== record.id);
                        break;
                }
            },
        );
        unsubscribes.push(unsubscribe);
    });

    onDestroy(() => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
    });
</script>

<div class={className}>
    {#if participant === undefined || items === undefined}
        <Skeleton class="h-5 mb-4 w-40 mt-6" />
        {#each Array(5) as _}
            <Skeleton class="h-20 mt-2" />
        {/each}
    {:else}
        <p class="font-bold text-lg">Battle Pass ส่วนตัว</p>
        {#each items as item (item.id)}
            <div animate:flip={{duration: animationDuration}} in:fade={{duration: animationDuration}} out:fade={{duration: animationDuration}}>
                <ItemView {participant} {item} class="mt-2 rounded-lg overflow-hidden drop-shadow-md" />
            </div>
        {/each}
    {/if}
</div>