<script lang="ts">
	import { EditorState } from '@codemirror/state';
	import { EditorView, placeholder } from '@codemirror/view';
	import type { Attachment } from 'svelte/attachments';
	import type { CachedNote } from '$lib/core/spaces/space/cached-notes.svelte';
	import { vyliteMarkdown } from '$lib/plugin-kit/markdown';
	import './NotePreview.scss';

	let { note }: { note: CachedNote | undefined } = $props();

	const preview: Attachment<HTMLElement> = (el) => {
		const view = new EditorView({
			parent: el,
			doc: note?.body,
			extensions: [
				vyliteMarkdown,
				EditorState.readOnly.of(true),
				EditorView.editable.of(false),
				placeholder('empty')
			]
		});

		return () => view.destroy();
	};
</script>

<div class="note-preview">
	{#if note}
		<div class="note-preview-body" {@attach preview}></div>
	{:else}
		<div class="note-preview-empty">select a note</div>
	{/if}
</div>
