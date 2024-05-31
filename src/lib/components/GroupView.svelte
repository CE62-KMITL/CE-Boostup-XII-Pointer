<script lang="ts">
	import type { GroupModel } from "$lib/interfaces/group-model.interface";
    import banner from '$lib/assets/banner/banner.avif';

    let className: string = '';
    export { className as class };
    export let group: GroupModel;
    export let groupScore: number | undefined;
</script>

<div class={className}>
    <p class="font-bold text-lg">คะแนนบ้าน {group.name}</p>
    <div style="background-image: url({banner});" class="rounded-lg h-16 w-auto mt-2 relative -z-20 bg-cover bg-center">
        <div class="absolute top-0 left-0 w-full h-full bg-white dark:bg-black opacity-80 rounded-lg -z-10"></div>
        <div class="w-auto h-full flex justify-center items-center">
            <p class="font-bold text-3xl">
                {#if groupScore === undefined}
                    <p>Loading...</p>
                {:else}
                    {groupScore.toLocaleString("en-US")}
                {/if}
            </p>
        </div>
    </div>
</div>
