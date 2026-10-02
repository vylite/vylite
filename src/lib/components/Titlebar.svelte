<script lang="ts">
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { onMount } from 'svelte';
	import './Titlebar.scss';

	const ICON = {
		minimize: '\u{f05b0}',
		maximize: '\u{f05af}',
		restore: '\u{f05b2}',
		close: '\u{f0156}'
	};

	const appWindow = getCurrentWindow();
	let maximized = $state(false);

	onMount(() => {
		void appWindow.isMaximized().then((value) => (maximized = value));
		const stopListening = appWindow.onResized(async () => {
			maximized = await appWindow.isMaximized();
		});

		return () => void stopListening.then((stop) => stop());
	});
</script>

<div class="titlebar-drag" data-tauri-drag-region></div>

<div class="titlebar-controls">
	<button
		class="titlebar-control"
		onclick={() => appWindow.minimize()}
		aria-label="minimize"
		title="minimize"
	>
		{ICON.minimize}
	</button>

	<button
		class="titlebar-control"
		onclick={() => appWindow.toggleMaximize()}
		aria-label={maximized ? 'restore' : 'maximize'}
		title={maximized ? 'restore' : 'maximize'}
	>
		{maximized ? ICON.restore : ICON.maximize}
	</button>

	<button
		class="titlebar-control titlebar-close"
		onclick={() => appWindow.close()}
		aria-label="close"
		title="close"
	>
		{ICON.close}
	</button>
</div>
