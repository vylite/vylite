<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { App } from '$lib/core/app';
	import List from '$lib/plugin-kit/components/List.svelte';
	import type { RovingList } from '$lib/plugin-kit/roving-list.svelte';
	import { applyTheme, getTheme, type Theme } from './shared/theme';
	import './Themes.scss';

	let { app, list }: { app: App; list: RovingList<Theme> } = $props();

	$effect(() => {
		const selected = list.getSelected();
		if (selected) applyTheme(selected);
	});

	onDestroy(() => {
		const saved = getTheme(app.appearance.get().theme);
		if (saved) applyTheme(saved);
	});
</script>

<div class="themes">
	<List {list} getKey={(theme) => theme.name} empty="no themes">
		{#snippet row(theme)}
			<span class="list-row-name">{theme.name}</span>
			<span class="list-row-note">
				{theme.name === app.appearance.get().theme ? 'current' : ''}
			</span>
		{/snippet}
	</List>
</div>
