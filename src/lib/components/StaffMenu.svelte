<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';
	import { swipe } from 'svelte-gestures';

	import { pushState } from '$app/navigation';
	import { page } from '$app/stores';
	import { getUrlWithoutSubpage } from '$lib/get-url-without-subpage';

	let className: string = '';
	export { className as class };
</script>

<div class={className}>
	<p class="text-lg font-bold">Staff Zone</p>
	<div class="mt-1 drop-shadow-lg">
		<button
			use:swipe={{ timeframe: 300, minSwipeDistance: 60, touchAction: 'pan-y' }}
			on:swipe={(event) => {
				if (event.detail.direction !== 'left') return;
				pushState(`${getUrlWithoutSubpage($page.url.pathname)}/add-score`, {
					subpage: 'add-score'
				});
			}}
			on:click={() => {
				pushState(`${getUrlWithoutSubpage($page.url.pathname)}/add-score`, {
					subpage: 'add-score'
				});
			}}
			class="link-btn rounded-b-none rounded-t-lg"
		>
			เพิ่มคะแนน
			<ChevronRight class="text-slate-400" />
		</button>
		<button
			use:swipe={{ timeframe: 300, minSwipeDistance: 60, touchAction: 'pan-y' }}
			on:swipe={(event) => {
				if (event.detail.direction !== 'left') return;
				pushState(`${getUrlWithoutSubpage($page.url.pathname)}/subtract-score`, {
					subpage: 'subtract-score'
				});
			}}
			on:click={() => {
				pushState(`${getUrlWithoutSubpage($page.url.pathname)}/subtract-score`, {
					subpage: 'subtract-score'
				});
			}}
			class="link-btn rounded-none">หักคะแนนบ้าน<ChevronRight class="text-slate-400" /></button
		>
		<button
			use:swipe={{ timeframe: 300, minSwipeDistance: 60, touchAction: 'pan-y' }}
			on:swipe={(event) => {
				if (event.detail.direction !== 'left') return;
				pushState(`${getUrlWithoutSubpage($page.url.pathname)}/transaction`, {
					subpage: 'transaction'
				});
			}}
			on:click={() => {
				pushState(`${getUrlWithoutSubpage($page.url.pathname)}/transaction`, {
					subpage: 'transaction'
				});
			}}
			class="link-btn rounded-b-lg rounded-t-none border-b"
		>
			ดู Transaction<ChevronRight class="text-slate-400" />
		</button>
	</div>
</div>

<style lang="postcss">
	.link-btn {
		@apply flex h-12 w-full items-center justify-between border-x border-t border-slate-300 bg-slate-50 px-4 text-left text-base font-medium dark:border-slate-600 dark:bg-slate-900;
	}
</style>
