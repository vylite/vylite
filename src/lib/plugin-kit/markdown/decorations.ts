import { syntaxTree } from '@codemirror/language';
import type { Range } from '@codemirror/state';
import {
	Decoration,
	ViewPlugin,
	type DecorationSet,
	type EditorView,
	type ViewUpdate
} from '@codemirror/view';

const HIDDEN_MARKS = new Set(['HeaderMark', 'EmphasisMark', 'CodeMark', 'StrikethroughMark']);
const CODE_BLOCKS = new Set(['FencedCode', 'CodeBlock']);

const hiddenMark = Decoration.replace({});
const codeLine = Decoration.line({ class: 'markdown-code-line' });

export const markdownDecorations = ViewPlugin.fromClass(
	class {
		decorations: DecorationSet;

		constructor(view: EditorView) {
			this.decorations = getDecorations(view);
		}

		update(update: ViewUpdate): void {
			const isParsedFurther = syntaxTree(update.startState) !== syntaxTree(update.state);

			if (
				update.docChanged ||
				update.selectionSet ||
				update.viewportChanged ||
				update.focusChanged ||
				isParsedFurther
			)
				this.decorations = getDecorations(update.view);
		}
	},
	{ decorations: (plugin) => plugin.decorations }
);

function getDecorations(view: EditorView): DecorationSet {
	const { doc, selection } = view.state;
	const decorations: Range<Decoration>[] = [];

	for (const { from, to } of view.visibleRanges) {
		syntaxTree(view.state).iterate({
			from,
			to,
			enter: (node) => {
				if (CODE_BLOCKS.has(node.name)) {
					const lastLine = doc.lineAt(node.to).number;

					for (let n = doc.lineAt(node.from).number; n <= lastLine; n++) {
						decorations.push(codeLine.range(doc.line(n).from));
					}
				}

				if (!HIDDEN_MARKS.has(node.name)) return;

				const marked = node.node.parent ?? node;
				const isCursorOnIt = selection.ranges.some(
					(range) => range.from <= marked.to && range.to >= marked.from
				);
				if (view.hasFocus && isCursorOnIt) return;

				const isBeforeSpace = doc.sliceString(node.to, node.to + 1) === ' ';
				const end = node.name === 'HeaderMark' && isBeforeSpace ? node.to + 1 : node.to;

				decorations.push(hiddenMark.range(node.from, end));
			}
		});
	}

	return Decoration.set(decorations, true);
}
