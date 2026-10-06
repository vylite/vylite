<script lang="ts">
	import type { App } from '$lib/core/app';
	import type { SpaceEntry } from '$lib/core/spaces/shared/saved-list';
	import List from '$lib/plugin-kit/components/List.svelte';
	import type { RovingList } from '$lib/plugin-kit/roving-list.svelte';
	import './Spaces.scss';

	let { app, list }: { app: App; list: RovingList<SpaceEntry> } = $props();

	const activePath = $derived(app.spaces.getActive()?.root);
	const activeEntry = $derived(list.getItems().find((entry) => entry.path === activePath));

	function getName(path: string): string {
		return path.split(/[\\/]/).filter(Boolean).at(-1) ?? path;
	}

	function getDate(time: number): string {
		return new Date(time).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="spaces">
	{#if activeEntry}
		<div class="spaces-info">
			<div class="spaces-info-row">
				<span class="spaces-info-key">space</span>
				<span class="spaces-info-value">{getName(activeEntry.path)}</span>
			</div>
			<div class="spaces-info-row">
				<span class="spaces-info-key">path</span>
				<span class="spaces-info-value">{activeEntry.path}</span>
			</div>
			<div class="spaces-info-row">
				<span class="spaces-info-key">created</span>
				<span class="spaces-info-value">{getDate(activeEntry.createdAt)}</span>
			</div>
		</div>
	{/if}

	<List {list} getKey={(entry) => entry.path} empty="no spaces yet">
		{#snippet row(entry)}
			<span class="list-row-name">{getName(entry.path)}</span>
			<span class="list-row-note">{entry.path === activePath ? 'active' : entry.path}</span>
		{/snippet}
	</List>
</div>
