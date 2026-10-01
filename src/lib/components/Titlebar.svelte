<script lang="ts">
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { onMount } from 'svelte';

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

<div class="drag-bar" data-tauri-drag-region></div>

<div class="controls">
	<button
		class="control"
		onclick={() => appWindow.minimize()}
		aria-label="minimize"
		title="minimize"
	>
		<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
			<path d="M5 12h14" />
		</svg>
	</button>

	<button
		class="control"
		onclick={() => appWindow.toggleMaximize()}
		aria-label={maximized ? 'restore' : 'maximize'}
		title={maximized ? 'restore' : 'maximize'}
	>
		{#if maximized}
			<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
				<rect x="8" y="8" width="12" height="12" rx="1" />
				<path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
			</svg>
		{:else}
			<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
				<rect x="4" y="4" width="16" height="16" rx="1" />
			</svg>
		{/if}
	</button>

	<button class="control close" onclick={() => appWindow.close()} aria-label="close" title="close">
		<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
			<path d="M18 6 6 18M6 6l12 12" />
		</svg>
	</button>
</div>

<style>
	.drag-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 20px;
		z-index: 20;
	}

	.controls {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 21;
		display: flex;
		height: 32px;
		background: var(--color-background);
		-webkit-user-select: none;
		user-select: none;
	}

	.control {
		display: grid;
		place-items: center;
		width: 46px;
		height: 100%;
		color: var(--color-text-muted);
		background: none;
		border: none;
	}

	.control svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.control:hover {
		background: var(--color-surface-secondary);
		color: var(--color-text);
	}

	.control.close:hover {
		background: color-mix(in srgb, var(--color-error) 75%, black);
		color: #fff;
	}
</style>
