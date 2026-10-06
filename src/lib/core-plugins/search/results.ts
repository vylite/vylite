import type { CachedNote } from '$lib/core/spaces/space/cached-notes.svelte';

const MAX_RESULTS = 3;
const LINE_LEAD = 24;

const RANK = {
	titleIsQuery: 5,
	titleStartsWithQuery: 4,
	titleContainsQuery: 3,
	titleHasEveryTerm: 2,
	noteHasEveryTerm: 1,
	noMatch: 0
};

export type SearchRow =
	{ kind: 'note'; note: CachedNote; line: string | null } | { kind: 'create'; title: string };

export function getRows(typed: string, notes: CachedNote[]): SearchRow[] {
	const query = typed.trim().toLowerCase();
	const terms = getTerms(typed);

	const rows = notes
		.map((note) => ({ note, rank: getRank(note, query, terms) }))
		.filter((ranked) => ranked.rank !== RANK.noMatch)
		.sort(
			(first, second) =>
				second.rank - first.rank || second.note.fileModified - first.note.fileModified
		)
		.slice(0, MAX_RESULTS)
		.map(({ note, rank }): SearchRow => {
			const line = rank === RANK.noteHasEveryTerm ? getMatchLine(note.body, terms) : null;

			return { kind: 'note', note, line };
		});

	return rows.length > 0 ? rows : [{ kind: 'create', title: typed.trim() }];
}

export function getPieces(line: string, terms: string[]): { text: string; isMatch: boolean }[] {
	const escapedTerms = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
	const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

	return line
		.split(pattern)
		.map((text, i) => ({ text, isMatch: i % 2 === 1 }))
		.filter((piece) => piece.text !== '');
}

export function getTerms(typed: string): string[] {
	return typed.toLowerCase().split(/\s+/).filter(Boolean);
}

function getRank(note: CachedNote, query: string, terms: string[]): number {
	const title = note.name.toLowerCase();

	if (title === query) return RANK.titleIsQuery;
	if (title.startsWith(query)) return RANK.titleStartsWithQuery;
	if (title.includes(query)) return RANK.titleContainsQuery;
	if (terms.every((term) => title.includes(term))) return RANK.titleHasEveryTerm;

	const body = note.body.toLowerCase();
	if (terms.every((term) => title.includes(term) || body.includes(term)))
		return RANK.noteHasEveryTerm;

	return RANK.noMatch;
}

function getMatchLine(body: string, terms: string[]): string {
	const lines = body.split('\n');
	const term = terms.find((term) => body.toLowerCase().includes(term)) ?? '';
	const matched = lines.find((line) => line.toLowerCase().includes(term)) ?? '';

	const line = matched
		.replace(/^\s*(#+|[-*+]|\d+\.|>)\s+(\[[ x]\]\s+)?/, '')
		.replace(/[*_`]/g, '')
		.trim();
	const at = line.toLowerCase().indexOf(term);
	if (at <= LINE_LEAD) return line;

	return '…' + line.slice(line.lastIndexOf(' ', at - LINE_LEAD / 2) + 1);
}
