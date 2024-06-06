<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_OAUTH_REDIRECT_URL } from '$env/static/public';
	import { pocketbase } from '$lib/pocketbase';

	async function updateProfile(id: string, metadata: { [key: string]: any }): Promise<void> {
		const formData = new FormData();
		if (metadata.name) {
			try {
				formData.append('name', metadata.name);
			} catch (err) {
				console.error(err);
			}
		}

		if (metadata.avatarUrl) {
			try {
				const avatarResponse = await fetch(metadata.avatarUrl);
				if (avatarResponse.ok) {
					formData.append('avatar', await avatarResponse.blob());
				}
			} catch (err) {
				console.error(err);
			}
		}

		const profileUpdatePromise = pocketbase.collection('users').update(id, formData);

		toast.promise(profileUpdatePromise, {
			loading: 'Updating user profile...',
			success: 'User profile updated successfully!',
			error: (err) => {
				console.error(err);
				return `An error occured during user profile update: ${err instanceof Error ? err.message : 'Unknown error'}`;
			}
		});
	}

	onMount(async () => {
		const params = new URL($page.url).searchParams;
		const provider = JSON.parse(localStorage.getItem('oauthProvider') ?? '{}');
		localStorage.removeItem('oauthProvider');

		let redirectTo = localStorage.getItem('oauthFinishRedirectTo') ?? '/';
		if (!redirectTo.startsWith('/')) {
			redirectTo = '/' + redirectTo;
		}
		localStorage.removeItem('oauthFinishRedirectTo');

		if (provider.state !== params.get('state')) {
			console.error('State parameter mismatch');
			toast.error('State parameter mismatch', {
				description: 'This URL is not valid for authentication. Please try again.'
			});

			goto(redirectTo);
			return;
		}

		const authPromise = pocketbase
			.collection('users')
			.authWithOAuth2Code(
				provider.name,
				params.get('code') ?? '',
				provider.codeVerifier,
				PUBLIC_OAUTH_REDIRECT_URL
			);

		toast.promise(authPromise, {
			loading: 'Authenticating...',
			success: (data) => {
				const meta = data.meta;
				if (meta && meta.isNew) {
					updateProfile(data.record.id, meta);
				}
				goto(redirectTo);
				return 'Logged in successfully!';
			},
			error: (err) => {
				console.error(err);
				goto(redirectTo);
				return `An error occured during OAuth2 flow: ${err instanceof Error ? err.message : 'Unknown error'}`;
			}
		});
	});
</script>

Authenticating...
