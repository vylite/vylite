<script lang="ts">
	import type { App } from '$lib/core/app';
	import './Suggestions.scss';

	let { app }: { app: App } = $props();

	let element = $state<HTMLElement>();

	$effect(() => {
		const selected = element?.children[app.input.suggestions.getSelectedIndex()];
		selected?.scrollIntoView({ block: 'nearest' });
	});
</script>

<div class="suggestions" role="listbox" bind:this={element}>
	{#each app.input.suggestions.getAll() as command, i (command.trigger)}
		<div
			class="suggestions-row"
			role="option"
			aria-selected={i === app.input.suggestions.getSelectedIndex()}
		>
			<span class="suggestions-trigger">/{command.trigger}</span>
			<span class="suggestions-description">{command.description}</span>
		</div>
	{/each}
</div>
