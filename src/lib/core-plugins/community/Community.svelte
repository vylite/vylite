<script lang="ts">
	import { openUrl } from '@tauri-apps/plugin-opener';
	import type { App } from '$lib/core/app';
	import './Community.scss';

	let { app }: { app: App } = $props();

	const DISCORD_URL = 'https://discord.gg/twv7Rfs6cv';

	function open(): void {
		openUrl(DISCORD_URL).catch((error: unknown) => app.errors.report(error));
	}
</script>

<div class="community">
	<p class="community-text">The best way to support vylite is to join the community :)</p>
	<p class="community-text">
		<button type="button" class="community-link" onclick={open}>
			{DISCORD_URL.replace('https://', '')}
		</button>
	</p>
</div>
