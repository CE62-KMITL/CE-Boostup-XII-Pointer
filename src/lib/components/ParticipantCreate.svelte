<script lang="ts">
    import { createForm } from 'felte';
    import { pocketbase } from '$lib/pocketbase';
    import { Input } from '$lib/components/ui/input/index';
    import { Button } from '$lib/components/ui/button/index';
	import { Label } from '$lib/components/ui/label/index';
    import { validator } from '@felte/validator-zod';
    import { participantSchema } from '$lib/schemas/participant.schema';
    import * as Select from "$lib/components/ui/select";
	import type { GroupModel } from '$lib/interfaces/group-model.interface';
	import { onDestroy, onMount } from 'svelte';
    import { toast } from 'svelte-sonner';
    import { createEventDispatcher } from 'svelte'
    import * as Avatar from '$lib/components/ui/avatar';
	import { getInitial } from '$lib/get-initial';

    let className: string = '';
    export { className as class };
    export let id: string;

    const dispatch = createEventDispatcher()
    let groups: GroupModel[] | undefined = undefined;

    const unsubscribes: (() => void)[] = [];

    onMount(async () => {
        groups = await pocketbase.collection('groups').getFullList<GroupModel>();
        const unsubscribe = await pocketbase.collection('groups').subscribe<GroupModel>(
           '*',
           ({ action, record }) => {
                switch (action) {
                    case 'create':
                        groups?.push(record);
                        break;
                    case 'update':
                        const index = groups?.findIndex((group) => group.id === record.id);
                        if (index !== undefined && groups && index !== -1) {
                            groups[index] = record;
                        }
                        break;
                    case 'delete':
                        groups = groups?.filter((group) => group.id !== record.id);
                        break;
                }
            },
        );
        unsubscribes.push(unsubscribe);
    });

    onDestroy(() => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
    });

    let group= '';

    $: selectedGroup = group ? {
        value: group,
        label: `บ้าน ${groups?.find((g) => g.id === group)?.name}`
    } : undefined;

    const { form, errors } = createForm({
        onSubmit: (values) => {
            const data = {
                ...values,
                id,
                group,
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
                    return `An error occured during participant creation: ${err instanceof Error ? err.message : 'Unknown error'}`
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
    })
</script>

<form use:form class={className}>
    <Label for="name">ชื่อเล่น</Label>
	<Input name="name" value="น้อง" class="mb-4" />
    {#if $errors.name}
        {#each $errors.name as error}
            <p class="text-red-500">{error}</p>
        {/each}
    {/if}
    <Label for="fullName">ชื่อ-นามสกุล</Label>
	<Input name="fullName" class="mb-4" />
    {#if $errors.fullName}
        {#each $errors.fullName as error}
            <p class="text-red-500">{error}</p>
        {/each}
    {/if}
    <input hidden name="group">
    <Label for="groupSelector">บ้าน</Label>
    <Select.Root selected={selectedGroup} onSelectedChange={(v) => {group = v?.value ?? ''}} name="groupSelector">
        <Select.Trigger class="mb-4">
            <Select.Value placeholder="เลือกบ้าน" />
        </Select.Trigger>
        <Select.Content>
            {#if groups === undefined}
                <Select.Item value="None">Loading...</Select.Item>
            {:else}
                {#each groups as group}
                    <Select.Item value={group.id} label={`บ้าน ${group.name}`} >
                        <Avatar.Root class="w-8 h-8">
                            <Avatar.Image
                                src={pocketbase.files.getUrl(group, group.avatar, {
                                    thumb: '64x64'
                                })}
                                alt="Avatar of {group.name}"
                            />
                            <Avatar.Fallback class="text-base font-medium">{getInitial(group.name)}</Avatar.Fallback>
                        </Avatar.Root>
                            <p class="ml-2">{`บ้าน ${group.name}`}</p>
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
    <Button type="submit" class="w-full">ตกลง</Button>
</form>
