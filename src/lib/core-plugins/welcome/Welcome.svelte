<script lang="ts">
	import type { App } from '$lib/core/app';
	import './Welcome.scss';

	const TRIGGERS = ['start', 'pick'];

	let { app }: { app: App } = $props();
</script>

<div class="welcome">
	<h1 class="welcome-title">welcome to vylite</h1>
	<p class="welcome-subtitle">choose a location for your notes</p>

	<div class="welcome-options">
		{#each TRIGGERS as trigger (trigger)}
			{@const command = app.commands.get(trigger)}
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
