<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { App } from '$lib/core/app';
	import List from '$lib/plugin-kit/components/List.svelte';
	import type { AppearancePanel } from './panel.svelte';
	import './Appearance.scss';

	let { app, panel }: { app: App; panel: AppearancePanel } = $props();

	const focus: Attachment<HTMLInputElement> = (element) => {
		element.focus();
		element.select();
	};

	function onTextKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			event.preventDefault();
			panel.finishEditing();
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			panel.cancelEditing();
		}
	}
</script>

<div class="appearance">
	<List list={panel.list} getKey={(row) => row.key}>
		{#snippet row(row)}
			<span class="list-row-name">{row.label}</span>
			<span class="list-row-note">
				{row.kind === 'size' ? `${app.appearance.get()[row.key]}px` : app.appearance.get()[row.key]}
			</span>
		{/snippet}
	</List>

	{#if panel.isEditing()}
		<input
			class="appearance-text"
			type="text"
			autocomplete="off"
			spellcheck="false"
			value={app.appearance.get().placeholder}
			oninput={(event) => panel.setPlaceholder(event.currentTarget.value)}
			onkeydown={onTextKeydown}
			onblur={() => panel.finishEditing()}
			{@attach focus}
		/>
	{/if}
</div>
