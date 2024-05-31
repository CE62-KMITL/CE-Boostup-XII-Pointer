<script lang="ts">
	import type { ItemModel } from "$lib/interfaces/ItemModel.interface";
	import type { ParticipantModel } from "$lib/interfaces/participant-model.interface";
	import { pocketbase } from "$lib/pocketbase";
	import ItemView from "./ItemView.svelte";

    let className: string = '';
    export { className as class };
    export let participant: ParticipantModel;
    export let items: Promise<ItemModel[]>;

    const battlePass = pocketbase.collection('')
</script>

<div class={className}>
    <p class="font-bold text-lg">Battle Pass ส่วนตัว</p>
    {#await items}
        <p>Loading...</p>
    {:then items}
        {#each items as item (item.id)}
            <ItemView {participant} {item} class="mt-2 rounded-lg overflow-hidden drop-shadow-md" />
        {/each}
    {:catch error}
        {error}
    {/await}
</div>