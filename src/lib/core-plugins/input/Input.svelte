<script lang="ts">
	import type { App } from '$lib/core/app';
	import './Input.scss';

	let { app }: { app: App } = $props();

	const view = $derived(app.input.view.get());
</script>

<div class="input" data-message-code={view.message?.code}>
	<div class="input-field">
		<div class="input-ghost" aria-hidden="true">
			{#if view.value.startsWith('/')}<span class="input-ghost-mark">/</span>{/if}<span
				class="input-ghost-typed"
				>{view.value.startsWith('/') ? view.value.slice(1) : view.value}</span
			><span class="input-ghost-text">{view.ghost}</span>
		</div>
		<input
			class="input-text"
			type="text"
			autocomplete="off"
			spellcheck="false"
			placeholder={app.ui.pages.isHome() ? app.appearance.get().placeholder : ''}
			value={view.value}
			{@attach app.input.element.attach}
		/>

		{#if view.message && view.message.code !== 'COMMAND_NOT_FOUND'}
			<div class="input-message" data-kind={view.message.kind}>
				<span class="input-message-text">{view.message.text}</span>
			</div>
		{/if}
	</div>
</div>
