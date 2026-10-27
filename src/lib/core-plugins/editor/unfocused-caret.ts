import { EditorSelection } from '@codemirror/state';
import { layer, RectangleMarker, type EditorView } from '@codemirror/view';
import './unfocused-caret.scss';

export const unfocusedCaret = layer({
	above: true,
	class: 'unfocused-caret-layer',
	update: (update) => update.focusChanged || update.selectionSet || update.docChanged,
	markers: (view) => {
		if (view.hasFocus) return [];

		const cursor = EditorSelection.cursor(getPositionBeforeText(view), 1);
		return RectangleMarker.forRange(view, 'unfocused-caret', cursor);
	}
});

function getPositionBeforeText(view: EditorView): number {
	const { head } = view.state.selection.main;
	const left = view.coordsAtPos(head, 1)?.left;
	if (left === undefined) return head;

	const lineEnd = view.state.doc.lineAt(head).to;
	let position = head;

	while (position < lineEnd && view.coordsAtPos(position + 1, 1)?.left === left) position++;

	return position;
}
