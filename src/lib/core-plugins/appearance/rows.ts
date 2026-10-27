import type { Appearance } from '$lib/core/appearance/schema';

export type SizeRow = {
	kind: 'size';
	key: 'borderWidth' | 'borderRadius' | 'innerGap' | 'edgeGap' | 'rowPadding';
	label: string;
	variable: string;
	min: number;
	max: number;
};

export type TextRow = {
	kind: 'text';
	key: 'placeholder';
	label: string;
};

export type Row = SizeRow | TextRow;

const SIZE_ROWS: readonly SizeRow[] = [
	{
		kind: 'size',
		key: 'borderWidth',
		label: 'border width',
		variable: '--border-width',
		min: 0,
		max: 4
	},
	{
		kind: 'size',
		key: 'borderRadius',
		label: 'border radius',
		variable: '--border-radius',
		min: 0,
		max: 24
	},
	{
		kind: 'size',
		key: 'innerGap',
		label: 'interior gap',
		variable: '--inner-gap',
		min: 0,
		max: 32
	},
	{
		kind: 'size',
		key: 'edgeGap',
		label: 'edge gap',
		variable: '--edge-gap',
		min: 0,
		max: 48
	},
	{
		kind: 'size',
		key: 'rowPadding',
		label: 'row padding',
		variable: '--row-padding',
		min: 0,
		max: 16
	}
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
