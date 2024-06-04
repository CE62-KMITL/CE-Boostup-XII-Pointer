<script lang="ts">
	import banner from '$lib/assets/banner/banner.avif';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { format } from '$lib/format-number';
	import type { GroupModel } from '$lib/interfaces/group-model.interface';

	let className: string = '';
	export { className as class };
	export let group: GroupModel | undefined;
	export let groupScore: number | undefined;
</script>

<div class={className}>
	{#if group === undefined || groupScore === undefined}
		<Skeleton class="my-2 mt-6 h-5 w-36" />
		<Skeleton class="mt-3 h-16 w-auto" />
	{:else}
		<p class="text-lg font-bold">คะแนนบ้าน {group.name}</p>
		<div class="w-full text-left">
			<div
				style="background-image: url({banner});"
				class="relative -z-20 mt-2 h-16 w-auto rounded-lg bg-cover bg-center"
			>
				<div
					class="absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white opacity-80 dark:bg-black"
				></div>
				<div class="h-full w-auto text-center">
					<p class="	p-4 text-3xl font-bold">
						{format(groupScore, 1e7, 1e-6, 3)}
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
