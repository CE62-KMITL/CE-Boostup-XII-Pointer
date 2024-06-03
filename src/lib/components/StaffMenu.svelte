<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';

	let className: string = '';
	export { className as class };
	export let subpage: Writable<'add-score' | 'subtract-score' | 'transaction' | undefined>;
</script>

<div class={className}>
	<p class="text-lg font-bold">Staff Zone</p>
	<div class="mt-1 drop-shadow-lg">
		<button
			on:click={() => {
				$subpage = 'add-score';
			}}
			class="link-btn brounded-b-none rounded-t-lg"
		>
			เพิ่มคะแนน
			<ChevronRight class="text-gray-400" />
		</button>
		<button
			on:click={() => {
				$subpage = 'subtract-score';
			}}
			class="link-btn rounded-none">หักคะแนนบ้าน<ChevronRight class="text-gray-400" /></button
		>
		<button
			on:click={() => {
				$subpage = 'transaction';
			}}
			class="link-btn rounded-b-lg rounded-t-none border-b"
		>
			ดู Transaction<ChevronRight class="text-gray-400" />
		</button>
	</div>
</div>

<style lang="postcss">
	.link-btn {
		@apply flex h-12 w-full items-center justify-between border-x border-t border-gray-300 bg-gray-50 px-4 text-left text-base font-medium dark:border-gray-600 dark:bg-gray-900;
	}
</style>
