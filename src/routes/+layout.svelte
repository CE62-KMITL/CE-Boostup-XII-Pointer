<script lang="ts">
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';
	import { ModeWatcher, resetMode, setMode } from 'mode-watcher';
	import Device from 'svelte-device-info';
	import { toast } from 'svelte-sonner';

	import '../app.css';

	import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button/index';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Toaster } from '$lib/components/ui/sonner';
	import { getInitial } from '$lib/get-initial';
	import { currentUser, pocketbase } from '$lib/pocketbase';
	import { browser } from '$app/environment';

	let innerWidth = 0;

	$: isPhone = !browser || (innerWidth < 640 && innerWidth !== 0) || Device.isPhone;

	async function login(): Promise<void> {
		try {
			const data = await pocketbase.collection('users').authWithOAuth2({ provider: 'google' });

			const meta = data.meta;

			if (meta && meta.isNew) {
				const formData = new FormData();

				if (meta.name) {
					formData.append('name', meta.name);
				}

				if (meta.avatarUrl) {
					const avatarResponse = await fetch(meta.avatarUrl);
					if (avatarResponse.ok) {
						formData.append('avatar', await avatarResponse.blob());
					}
				}

				try {
					await pocketbase.collection('users').update(data.record.id, formData);
				} catch (err) {
					console.error(err);
					toast.error('An error occured during user data update', {
						description: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
					});
				}
			}
		} catch (err) {
			console.error(err);
			toast.error('An error occured during OAuth2 flow', {
				description: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
			});
			return;
		}
		toast.success('Logged in successfully!');
	}

	async function logout(): Promise<void> {
		pocketbase.authStore.clear();
		toast.success('Logged out successfully!');
	}

	const setModeLight = (): void => setMode('light');
	const setModeDark = (): void => setMode('dark');

	const openProfileEdit = (): void => {
		const openProfileEditButton = document.getElementById('openProfileEditButton');

		if (openProfileEditButton) {
			openProfileEditButton.click();
		}
	};

	let updateUserName = $currentUser?.name ?? '';
	let updateUserAvatar: FileList;

	async function updateUser(): Promise<void> {
		if (!$currentUser) {
			toast.error('You must be logged in to update your profile');
			return;
		}

		const formData = new FormData();

		formData.append('name', updateUserName);

		const avatarFile = updateUserAvatar?.[0];
		if (avatarFile) {
			formData.append('avatar', avatarFile);
		}

		const updatePromise = pocketbase.collection('users').update($currentUser.id, formData);
		toast.promise(updatePromise, {
			loading: 'Updating profile...',
			success: 'Profile updated successfully!',
			error: (err) => {
				console.error(err);
				return `An error occured during user profile update: ${err instanceof Error ? err.message : 'Unknown error'}`;
			}
		});
	}
</script>

<svelte:window bind:innerWidth />

<svelte:head>
	<link rel="preconnect" href={PUBLIC_POCKETBASE_URL} />
</svelte:head>

<ModeWatcher />
<Toaster richColors closeButton position={isPhone ? 'top-center' : 'bottom-right'} />

<nav class="mx-4 mb-1 mt-6 flex justify-between">
	<div>
		<h1 class="text-2xl font-bold">Pointer</h1>
		<h2 class="text-base font-medium">เว็บเก็บคะแนน CE Boost Up 12</h2>
	</div>
	<div class="flex items-center space-x-4">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button builders={[builder]} variant="outline" size="icon">
					<Sun
						class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
					/>
					<Moon
						class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item on:click={setModeLight}>Light</DropdownMenu.Item>
				<DropdownMenu.Item on:click={setModeDark}>Dark</DropdownMenu.Item>
				<DropdownMenu.Item on:click={resetMode}>System</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		{#if $currentUser}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					><Avatar.Root>
						<Avatar.Image
							src={pocketbase.files.getUrl($currentUser, $currentUser.avatar, { thumb: '128x128' })}
							alt="Avatar of {$currentUser.name}"
						/>
						<Avatar.Fallback>{getInitial($currentUser.name)}</Avatar.Fallback>
					</Avatar.Root></DropdownMenu.Trigger
				>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item on:click={openProfileEdit}>Profile</DropdownMenu.Item>
						<DropdownMenu.Item on:click={logout}>Logout</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{:else}
			<Button on:click={login} variant="outline">Staff</Button>
		{/if}
	</div>
</nav>

<Sheet.Root>
	<Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} id="openProfileEditButton" class="hidden">Open</Button>
	</Sheet.Trigger>
	<Sheet.Content side={isPhone ? 'bottom' : 'right'}>
		<Sheet.Header>
			<Sheet.Title>Edit profile</Sheet.Title>
			<Sheet.Description>
				Make changes to your profile here. Click save when you're done.
			</Sheet.Description>
		</Sheet.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="name" class="text-right">Name</Label>
				<Input id="name" bind:value={updateUserName} class="col-span-3" />
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="avatar" class="text-right">Avatar</Label>
				<input
					id="avatar"
					bind:files={updateUserAvatar}
					type="file"
					accept="image/jpeg,image/png,image/svg+xml,image/gif,image/webp,image/avif"
					class="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				/>
			</div>
		</div>
		<Sheet.Footer>
			<Sheet.Close asChild let:builder>
				<Button builders={[builder]} on:click={updateUser} type="submit">Save changes</Button>
			</Sheet.Close>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>

<slot />
