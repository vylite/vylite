<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { App } from '$lib/core/app';
	import './Help.scss';

	let { app }: { app: App } = $props();

	const commands = $derived(
		app.commands
			.getAll()
			.filter((command) => !command.internal)
			.sort((first, second) => first.trigger.localeCompare(second.trigger))
	);

	const focus: Attachment<HTMLElement> = (element) => element.focus();
</script>

<div class="help" tabindex="-1" {@attach focus}>
	{#each commands as command (command.trigger)}
		<div class="help-row">
			<span class="help-trigger">/{command.trigger}</span>
			<span class="help-description">{command.description}</span>
		</div>
	{/each}
</div>
