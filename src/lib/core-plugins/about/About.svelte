<script lang="ts">
	import { getVersion } from '@tauri-apps/api/app';
	import { openUrl } from '@tauri-apps/plugin-opener';
	import type { App } from '$lib/core/app';
	import './About.scss';

	let { app }: { app: App } = $props();

	const LINKS = [
		{ label: 'privacy policy', url: 'https://vylite.app/privacy' },
		{ label: 'terms of service', url: 'https://vylite.app/terms' }
	];

	let version = $state('');

	getVersion()
		.then((value) => (version = value))
		.catch((error: unknown) => app.errors.report(error));

	function open(url: string): void {
		openUrl(url).catch((error: unknown) => app.errors.report(error));
	}
</script>

<div class="about">
	<div class="about-row">
		<span class="about-name">vylite</span>
		{#if version}
			<span class="about-version">v{version}</span>
		{/if}
	</div>

	{#each LINKS as link (link.url)}
		<div class="about-row">
			<span class="about-link-label">{link.label}</span>
			<button type="button" class="about-link" onclick={() => open(link.url)}>
				{link.url.replace('https://', '')}
			</button>
		</div>
	{/each}
</div>
