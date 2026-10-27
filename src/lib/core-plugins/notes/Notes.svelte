<script lang="ts">
	import List from '$lib/plugin-kit/components/List.svelte';
	import NotePreview from './NotePreview.svelte';
	import type { NotesTree } from './tree.svelte';
	import './Notes.scss';

	const CLOSED_MARK = '\u{f460}';
	const OPEN_MARK = '\u{f47c}';

	let { tree }: { tree: NotesTree } = $props();
</script>

<div class="notes">
	<div class="notes-tree">
		<List list={tree.list} getKey={(item) => item.kind + item.path} empty="no notes yet">
			{#snippet row(item)}
				<span class="notes-mark" style:--depth={item.depth}>
					{#if item.kind === 'folder'}{item.isOpen ? OPEN_MARK : CLOSED_MARK}{/if}
				</span>
				<span class="list-row-name notes-name" data-kind={item.kind}>
					{item.kind === 'folder' ? `${item.name}/` : item.name}
				</span>
			{/snippet}
		</List>
	</div>

	<NotePreview note={tree.getSelectedNote()} />
</div>
