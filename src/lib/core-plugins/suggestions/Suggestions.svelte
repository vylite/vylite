<script lang="ts">
	import type { App } from '$lib/core/app';
	import './Suggestions.scss';

	let { app }: { app: App } = $props();

	let element = $state<HTMLElement>();

	const triggerLength = $derived(
		Math.max(0, ...app.input.dispatcher.getAll().map((command) => `/${command.trigger}`.length))
	);

	$effect(() => {
		const selected = element?.children[app.input.suggestions.getSelectedIndex()];
		selected?.scrollIntoView({ block: 'nearest' });
	});
</script>

<div
	class="suggestions"
	role="listbox"
	style:--suggestions-trigger-length={triggerLength}
	bind:this={element}
>
	{#each app.input.suggestions.getAll() as command, i (command.trigger)}
		<div
			class="suggestions-row"
			role="option"
			aria-selected={i === app.input.suggestions.getSelectedIndex()}
		>
			<span class="suggestions-trigger"
				><span class="suggestions-mark">/</span>{command.trigger}</span
			>
			<span class="suggestions-description">{command.description}</span>
		</div>
	{/each}
</div>
