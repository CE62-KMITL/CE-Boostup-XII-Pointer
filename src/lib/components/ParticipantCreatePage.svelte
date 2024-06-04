<script lang="ts">
	import { createForm } from 'felte';
	import { pocketbase } from '$lib/pocketbase';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { validator } from '@felte/validator-zod';
	import { participantSchema } from '$lib/schemas/participant.schema';
	import * as Select from '$lib/components/ui/select';
	import type { GroupModel } from '$lib/interfaces/group-model.interface';
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { getInitial } from '$lib/get-initial';

	let className: string = '';
	export { className as class };
	export let id: string;
	export let groups: GroupModel[] | undefined;

	const dispatch = createEventDispatcher();

	let group = '';

	$: selectedGroup = group
		? {
				value: group,
				label: `บ้าน ${groups?.find((g) => g.id === group)?.name}`
			}
		: undefined;

	const { form, errors } = createForm({
		onSubmit: (values) => {
			const data = {
				...values,
				id,
				group
			};
			const createPromise = pocketbase.collection('participants').create(data);
			toast.promise(createPromise, {
				loading: 'Creating participant...',
				success: () => {
					dispatch('created');
					return 'Participant created successfully!';
				},
				error: (err) => {
					console.error(err);
					return `An error occured during participant creation: ${err instanceof Error ? err.message : 'Unknown error'}`;
				}
			});
		},
		extend: [validator({ schema: participantSchema })],
		validate: (_) => {
			if (!group) {
				return {
					group: ['กรุณาเลือกบ้าน']
				};
			}
			return {};
		}
	});
</script>

<div class={className}>
	<h3 class="w-full text-center text-lg font-bold">กรอกข้อมูลน้อง</h3>
	<form use:form class="mx-5 my-4">
		<Label for="name" class="text-lg font-bold">ชื่อเล่น</Label>
		<Input
			name="name"
			value="น้อง"
			class="my-2 mt-2 border border-gray-700 text-base placeholder:text-base placeholder:font-medium placeholder:text-gray-400"
			autofocus
		/>
		{#if $errors.name}
			{#each $errors.name as error}
				<p class="text-red-500">{error}</p>
			{/each}
		{/if}
		<Label for="fullName" class="mt-6 block text-lg font-bold">ชื่อ-นามสกุล</Label>
		<Input
			name="fullName"
			class="my-2 border border-gray-700 text-base placeholder:text-base placeholder:font-medium placeholder:text-gray-400"
		/>
		{#if $errors.fullName}
			{#each $errors.fullName as error}
				<p class="text-red-500">{error}</p>
			{/each}
		{/if}
		<input hidden name="group" />
		<Label for="groupSelector" class="mt-6 block text-lg font-bold">บ้าน</Label>
		<Select.Root
			selected={selectedGroup}
			onSelectedChange={(v) => {
				group = v?.value ?? '';
			}}
			name="groupSelector"
		>
			<Select.Trigger class="my-2 border border-gray-700 text-base font-normal">
				<Select.Value placeholder="เลือกบ้าน" />
			</Select.Trigger>
			<Select.Content>
				{#if groups === undefined}
					<Select.Item value="None">Loading...</Select.Item>
				{:else}
					{#each groups as group}
						<Select.Item value={group.id} label={`บ้าน ${group.name}`} class="cursor-pointer">
							<Avatar.Root class="h-10 w-10">
								<Avatar.Image
									src={pocketbase.files.getUrl(group, group.avatar, {
										thumb: '64x64'
									})}
									alt="Avatar of {group.name}"
								/>
								<Avatar.Fallback class="text-lg font-medium"
									>{getInitial(group.name)}</Avatar.Fallback
								>
							</Avatar.Root>
							<p class="ml-2 text-base font-normal">{`บ้าน ${group.name}`}</p>
						</Select.Item>
					{/each}
				{/if}
			</Select.Content>
		</Select.Root>
		{#if $errors.group && !group}
			{#each $errors.group as error}
				<p class="text-red-500">{error}</p>
			{/each}
		{/if}
		<Button type="submit" class="mt-8 w-full bg-cprimary hover:bg-cprimary">ตกลง</Button>
	</form>
</div>
