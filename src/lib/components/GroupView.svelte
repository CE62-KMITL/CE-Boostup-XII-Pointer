<script lang="ts">
	import type { GroupModel } from "$lib/interfaces/group-model.interface";
    import banner from '$lib/assets/banner/banner.avif';
    import { Skeleton } from "$lib/components/ui/skeleton";

    let className: string = '';
    export { className as class };
    export let group: GroupModel | undefined;
    export let groupScore: number | undefined;
</script>

<div class={className}>
    {#if group === undefined || groupScore === undefined}
        <Skeleton class="h-5 my-2 w-36 mt-6" />
        <Skeleton class="h-16 w-auto mt-2" />
    {:else}
        <p class="font-bold text-lg">คะแนนบ้าน {group.name}</p>
        <div style="background-image: url({banner});" class="rounded-lg h-16 w-auto mt-2 relative -z-20 bg-cover bg-center">
            <div class="absolute top-0 left-0 w-full h-full bg-white dark:bg-black opacity-80 rounded-lg -z-10"></div>
            <div class="w-auto h-full flex justify-center items-center">
                <p class="font-bold text-3xl">
                    {groupScore.toLocaleString("en-US", { maximumFractionDigits: 2})}
                </p>
            </div>
        </div>
    {/if}
</div>
