<script lang="ts">
	import type { App } from '$lib/core/app';
	import './Input.scss';

	let { app }: { app: App } = $props();

	const view = $derived(app.input.view.get());
</script>

<div class="input" data-message-code={view.message?.code}>
	{#if view.label}
		<span class="input-label"><span class="input-label-text">{view.label}</span></span>
	{/if}

	<div class="input-field">
		<div class="input-ghost" aria-hidden="true">
			<span class="input-ghost-typed">{view.value}</span>{view.ghost}
		</div>
		<input
			class="input-text"
			type="text"
			autocomplete="off"
			spellcheck="false"
			placeholder={app.ui.pages.isHome() ? 'type here...' : ''}
			value={view.value}
			{@attach app.input.element.attach}
		/>
	</div>

	{#if view.message && view.message.code !== 'COMMAND_NOT_FOUND'}
		<span class="input-message" data-kind={view.message.kind}>{view.message.text}</span>
	{/if}
</div>
