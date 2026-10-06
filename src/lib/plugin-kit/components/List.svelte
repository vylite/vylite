<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { RovingList } from '../roving-list.svelte';
	import './List.scss';

	let {
		list,
		getKey,
		row,
		empty = ''
	}: {
		list: RovingList<T>;
		getKey: (item: T) => string;
		row: Snippet<[item: T]>;
		empty?: string;
	} = $props();

	let element = $state<HTMLElement>();

	$effect(() => {
		element?.children[list.getIndex()]?.scrollIntoView({ block: 'nearest' });
	});
</script>

<div class="list" role="listbox" bind:this={element}>
	{#each list.getItems() as item, i (getKey(item))}
		<button
			type="button"
			class="list-row"
			role="option"
			aria-selected={i === list.getIndex()}
			onclick={() => list.select(i)}
			ondblclick={() => list.open()}
		>
			{@render row(item)}
		</button>
	{:else}
		<div class="list-empty">{empty}</div>
	{/each}
</div>
