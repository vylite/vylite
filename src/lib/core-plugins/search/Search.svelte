<script lang="ts">
	import type { App } from '$lib/core/app';
	import List from '$lib/plugin-kit/components/List.svelte';
	import { getPieces, getTerms } from './results';
	import type { HomeSearch } from './search.svelte';
	import './Search.scss';

	let { app, search }: { app: App; search: HomeSearch } = $props();
</script>

<div class="search">
	<List list={search.list} getKey={(item) => (item.kind === 'note' ? item.note.path : '+')}>
		{#snippet row(item)}
			{#if item.kind === 'create'}
				<span class="list-row-name">+ {item.title}</span>
			{:else}
				<span class="list-row-name">{item.note.name}</span>
				{#if item.line}
					<span class="search-line">
						{#each getPieces(item.line, getTerms(app.input.element.getValue())) as piece, i (i)}
							{#if piece.isMatch}<mark class="search-match">{piece.text}</mark
								>{:else}{piece.text}{/if}
						{/each}
					</span>
				{/if}
			{/if}
		{/snippet}
	</List>
</div>
