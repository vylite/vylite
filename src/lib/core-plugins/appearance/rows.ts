import type { Appearance } from '$lib/core/appearance/schema';

export type SizeRow = {
	kind: 'size';
	key: 'borderWidth' | 'borderRadius' | 'innerGap';
	label: string;
	variable: string;
	max: number;
};

export type TextRow = {
	kind: 'text';
	key: 'placeholder';
	label: string;
};

export type Row = SizeRow | TextRow;

const SIZE_ROWS: readonly SizeRow[] = [
	{ kind: 'size', key: 'borderWidth', label: 'border width', variable: '--border-width', max: 4 },
	{
		kind: 'size',
		key: 'borderRadius',
		label: 'corner radius',
		variable: '--border-radius',
		max: 24
	},
	{ kind: 'size', key: 'innerGap', label: 'interior gap', variable: '--inner-gap', max: 32 }
];

export const ROWS: readonly Row[] = [
	...SIZE_ROWS,
	{ kind: 'text', key: 'placeholder', label: 'input placeholder' }
];

export function applySizes(appearance: Appearance): void {
	for (const row of SIZE_ROWS) {
		document.documentElement.style.setProperty(row.variable, `${appearance[row.key]}px`);
	}
}

export function removeSizes(): void {
	for (const row of SIZE_ROWS) {
		document.documentElement.style.removeProperty(row.variable);
	}
}
