<script lang="ts">
	import type { App } from '$lib/core/app';
	import './Suggestions.scss';

	const ROWS = 3;

	let { app }: { app: App } = $props();

	const firstVisible = $derived(Math.max(0, app.input.suggestions.getSelectedIndex() - ROWS + 1));
</script>

<div class="suggestions" role="listbox">
	{#each app.input.suggestions
		.getAll()
		.slice(firstVisible, firstVisible + ROWS) as command, i (command.trigger)}
		<div
			class="suggestions-row"
			role="option"
			aria-selected={firstVisible + i === app.input.suggestions.getSelectedIndex()}
		>
			<span class="suggestions-trigger">/{command.trigger}</span>
			<span class="suggestions-description">{command.description}</span>
		</div>
	{/each}
</div>
