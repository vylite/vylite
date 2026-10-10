<script lang="ts">
	import type { App } from '$lib/core/app';
	import List from '$lib/plugin-kit/components/List.svelte';
	import type { RovingList } from '$lib/plugin-kit/roving-list.svelte';
	import type { Toggle } from './toggles';
	import './Settings.scss';

	let { app, list }: { app: App; list: RovingList<Toggle> } = $props();
</script>

<div class="settings">
	<List {list} getKey={(toggle) => toggle.key} empty="no settings">
		{#snippet row(toggle)}
			<span class="list-row-name">{toggle.label}</span>
			<span class="list-row-note">{app.settings.get()[toggle.key] ? '[x] on' : '[ ] off'}</span>
		{/snippet}
	</List>
</div>
