import { sep } from '@tauri-apps/api/path';
import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Page } from '$lib/core/ui/shared/types';
import { NoteEditor } from './note-editor';
import { NoteSaver } from './note-saver';
import { createNote, UNTITLED } from './shared/note-files';

export const manifest: PluginManifest = { name: 'editor', author: 'vylite' };

const KEYS_WITHOUT_REFOCUS = ['/', 'Escape', 'Shift', 'Control', 'Alt', 'AltGraph', 'Meta'];

export default class EditorPlugin extends Plugin {
	onload(): void {
		const { commands } = this.app;

		this.addCleanup(
			commands.register({
				trigger: 'editor',
				description: 'open a note',
				internal: true,
				params: [{ placeholder: 'path', required: true }],
				run: ([path]) => this._getPage(path, false)
			})
		);

		this.addCleanup(
			commands.register({
				trigger: 'new',
				description: 'create a note',
				params: [{ placeholder: 'title' }],
				run: ([title]) => this._getNewPage(title)
			})
		);
	}

	private async _getNewPage(title: string | undefined): Promise<Page> {
		const path = await createNote(this.space.fs, title || UNTITLED);

		return this._getPage(path, !title);
	}

	private async _getPage(path: string, isNamedOnClose: boolean): Promise<Page> {
		const { body } = await this.space.fs.md.read(path);
		const saver = new NoteSaver(this.app, this.space.fs, path, isNamedOnClose);
		const editor = new NoteEditor(body, saver);

		return {
			label: path.slice(path.lastIndexOf(sep()) + 1, -'.md'.length),
			layout: 'tall',
			nest: {
				content: { mount: (el) => editor.mount(el), unmount: () => editor.close() },
				onKeydown: (event) => {
					if (!KEYS_WITHOUT_REFOCUS.includes(event.key)) editor.focus();
				}
			}
		};
	}
}
