import type { CommandParam } from '$lib/core/commands/types';
import { getWords } from './parse';

export type QuoteEdit = {
	value: string;
	caret: number;
};

export function getTypedQuote(value: string, caret: number): QuoteEdit {
	if (value[caret] === '"') return { value, caret: caret + 1 };

	return { value: `${value.slice(0, caret)}""${value.slice(caret)}`, caret: caret + 1 };
}

export function getQuotedArgStart(
	value: string,
	caret: number,
	text: string,
	params: CommandParam[]
): QuoteEdit | null {
	if (text.length !== 1 || text === '"' || /\s/.test(text)) return null;

	const before = value[caret - 1] ?? '';
	const after = value[caret] ?? '';
	if (/\S/.test(before) || /\S/.test(after)) return null;

	const words = getWords(value.slice(1, caret));
	if (words.length === 0 || words.length > params.length) return null;

	return {
		value: `${value.slice(0, caret)}"${text}"${value.slice(caret)}`,
		caret: caret + 1 + text.length
	};
}

export function getDroppedQuotePair(value: string, caret: number): QuoteEdit | null {
	if (value[caret - 1] !== '"' || value[caret] !== '"') return null;

	return { value: value.slice(0, caret - 1) + value.slice(caret + 1), caret: caret - 1 };
}
