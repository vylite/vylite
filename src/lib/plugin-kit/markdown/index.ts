import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { syntaxHighlighting } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tagHighlighter, tags } from '@lezer/highlight';
import { markdownDecorations } from './decorations';
import './Markdown.scss';

const classNames = tagHighlighter([
	{ tag: tags.heading1, class: 'markdown-heading markdown-heading-1' },
	{ tag: tags.heading2, class: 'markdown-heading markdown-heading-2' },
	{ tag: tags.heading3, class: 'markdown-heading markdown-heading-3' },
	{ tag: tags.heading4, class: 'markdown-heading markdown-heading-4' },
	{ tag: tags.heading5, class: 'markdown-heading markdown-heading-5' },
	{ tag: tags.heading6, class: 'markdown-heading markdown-heading-6' },
	{ tag: tags.strong, class: 'markdown-strong' },
	{ tag: tags.emphasis, class: 'markdown-emphasis' },
	{ tag: tags.strikethrough, class: 'markdown-strikethrough' },
	{ tag: tags.link, class: 'markdown-link' },
	{ tag: tags.url, class: 'markdown-url' },
	{ tag: tags.monospace, class: 'markdown-code' },
	{ tag: tags.quote, class: 'markdown-quote' },
	{ tag: tags.processingInstruction, class: 'markdown-mark' }
]);

export const vyliteMarkdown: Extension = [
	markdown({ base: markdownLanguage }),
	syntaxHighlighting(classNames),
	markdownDecorations,
	EditorView.lineWrapping,
	EditorView.editorAttributes.of({ class: 'markdown' })
];
