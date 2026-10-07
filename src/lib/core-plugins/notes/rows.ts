import { sep } from '@tauri-apps/api/path';
import type { CachedNote } from '$lib/core/spaces/space/cached-notes.svelte';

export type TreeRow =
	| { kind: 'folder'; path: string; name: string; depth: number; isOpen: boolean }
	| { kind: 'note'; path: string; name: string; depth: number };

type Folder = { path: string; name: string; folders: Map<string, Folder>; notes: CachedNote[] };

export function getRows(notes: CachedNote[], openFolders: ReadonlySet<string>): TreeRow[] {
	return getRowsIn(getRootFolder(notes), 0, openFolders);
}

function getRootFolder(notes: CachedNote[]): Folder {
	const root: Folder = { path: '', name: '', folders: new Map(), notes: [] };

	for (const note of notes) {
		let folder = root;

		for (const name of note.path.split(sep()).slice(0, -1)) {
			let child = folder.folders.get(name);

			if (!child) {
				const path = folder.path ? folder.path + sep() + name : name;
				child = { path, name, folders: new Map(), notes: [] };
				folder.folders.set(name, child);
			}

			folder = child;
		}

		folder.notes.push(note);
	}

	return root;
}

function getRowsIn(folder: Folder, depth: number, openFolders: ReadonlySet<string>): TreeRow[] {
	const folderRows = [...folder.folders.values()]
		.sort((first, second) => first.name.localeCompare(second.name))
		.flatMap((child): TreeRow[] => {
			const isOpen = openFolders.has(child.path);
			const inside = isOpen ? getRowsIn(child, depth + 1, openFolders) : [];

			return [{ kind: 'folder', path: child.path, name: child.name, depth, isOpen }, ...inside];
		});

	const noteRows = folder.notes
		.sort((first, second) => second.fileModified - first.fileModified)
		.map((note): TreeRow => ({ kind: 'note', path: note.path, name: note.name, depth }));

	return [...folderRows, ...noteRows];
}
