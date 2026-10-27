import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { drawSelection, EditorView, keymap, placeholder } from '@codemirror/view';
import { vyliteMarkdown } from '$lib/plugin-kit/markdown';
import type { NoteSaver } from './note-saver';
import { unfocusedCaret } from './unfocused-caret';

export class NoteEditor {
	private _view: EditorView | undefined;

	constructor(
		private readonly _body: string,
		private readonly _saver: NoteSaver
	) {}

	mount(el: HTMLElement): void {
		const isOnlyHeading = /^#{1,6}( [^\n]*)?\s*$/.test(this._body);

		this._view = new EditorView({
			parent: el,
			doc: this._body,
			selection: { anchor: isOnlyHeading ? this._body.length : 0 },
			extensions: [
				vyliteMarkdown,
				drawSelection({ cursorBlinkRate: 1000 }),
				unfocusedCaret,
				history(),
				keymap.of([
					{
						key: 'Escape',
						run: (view) => {
							view.contentDOM.blur();
							return true;
						}
					},
					indentWithTab,
					...defaultKeymap,
					...historyKeymap
				]),
				placeholder('start writing...'),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) this._saver.saveLater(update.state.doc.toString());
				})
			]
		});
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
