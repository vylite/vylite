import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { vyliteMarkdown } from '$lib/plugin-kit/markdown';
import type { NoteSaver } from './note-saver';

export class NoteEditor {
	private _view: EditorView | undefined;

	constructor(
		private readonly _body: string,
		private readonly _saver: NoteSaver
	) {}

	mount(el: HTMLElement): void {
		this._view = new EditorView({
			parent: el,
			doc: this._body,
			extensions: [
				vyliteMarkdown,
				history(),
				keymap.of([
					{
						key: 'Escape',
						run: (view) => {
							view.contentDOM.blur();
							return true;
						}
					},
					...defaultKeymap,
					...historyKeymap
				]),
				placeholder('start writing...'),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) this._saver.saveLater(update.state.doc.toString());
				})
			]
		});

		this._view.focus();
	}

	close(): void {
		if (!this._view) return;

		this._saver.finish(this._view.state.doc.toString());
		this._view.destroy();
	}

	focus(): void {
		this._view?.focus();
	}
}
