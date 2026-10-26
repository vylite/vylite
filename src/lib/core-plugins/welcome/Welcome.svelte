<script lang="ts">
	import type { App } from '$lib/core/app';
	import './Welcome.scss';

	const COMMAND_IDS = ['vylite.spaces.start', 'vylite.spaces.pick'];

	let { app }: { app: App } = $props();
</script>

<div class="welcome">
	<h1 class="welcome-title">welcome to vylite</h1>
	<p class="welcome-subtitle">choose a location for your notes</p>

	<div class="welcome-options">
		{#each COMMAND_IDS as id (id)}
			{@const command = app.commands.get(id)}
			{#if command}
				<div class="welcome-option">
					<span class="welcome-trigger">/{command.trigger}</span>
					<span class="welcome-description">{command.description}</span>
				</div>
			{/if}
		{/each}
	</div>

	<p class="welcome-keys"><kbd>/</kbd> runs a command, <kbd>esc</kbd> goes back</p>
</div>
