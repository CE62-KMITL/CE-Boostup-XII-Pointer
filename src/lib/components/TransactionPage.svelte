<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft } from 'lucide-svelte';
	import * as Tabs from '$lib/components/ui/tabs';

	let className: string = '';
	export { className as class };
	export let subpage: Writable<'add-score' | 'subtract-score' | 'transaction' | undefined>;
</script>

<div class={className}>
	<div class="flex items-center justify-between">
		<Button
			on:click={() => {
				$subpage = undefined;
			}}
			variant="ghost"
			class="flex-shrink-0"
		>
			<div class="flex items-center">
				<ChevronLeft class="mr-1.5" /><span class="text-base font-medium">กลับ</span>
			</div>
		</Button>
		<h3 class="flex-shrink-0 text-lg font-bold">ดู Transaction</h3>
		<div class="w-[87.63px]" />
	</div>
	<div class="mx-5 my-4">
		<Tabs.Root value="account">
			<Tabs.List class="flex justify-around">
				<Tabs.Trigger value="add-score" class="w-28 flex-grow">เพิ่มคะแนน</Tabs.Trigger>
				<Tabs.Trigger value="subtract-score" class="w-28 flex-grow">หักคะแนนบ้าน</Tabs.Trigger>
				<Tabs.Trigger value="items" class="w-28 flex-grow">รับของรางวัล</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="add-score">Score additions here</Tabs.Content>
			<Tabs.Content value="subtract-score">Score subtractions here</Tabs.Content>
			<Tabs.Content value="items">items log here</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
