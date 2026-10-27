import type { Anchor, Length, Padding, ScreenLayout, Size } from '$lib/core/appearance/schema';

type Alignment = 'flex-start' | 'center' | 'flex-end';

type Placement = { paddingStart: string; paddingEnd: string; size: string };

const PROPERTIES = [
	'width',
	'height',
	'padding-top',
	'padding-right',
	'padding-bottom',
	'padding-left',
	'anchor-x',
	'anchor-y'
] as const;

const ANCHORS: Record<Anchor, { x: Alignment; y: Alignment }> = {
	'top-left': { x: 'flex-start', y: 'flex-start' },
	top: { x: 'center', y: 'flex-start' },
	'top-right': { x: 'flex-end', y: 'flex-start' },
	left: { x: 'flex-start', y: 'center' },
	center: { x: 'center', y: 'center' },
	right: { x: 'flex-end', y: 'center' },
	'bottom-left': { x: 'flex-start', y: 'flex-end' },
	bottom: { x: 'center', y: 'flex-end' },
	'bottom-right': { x: 'flex-end', y: 'flex-end' }
};

export function applyLayout(layout: ScreenLayout, edgeGap: number): void {
	const across = getPlacement(layout.width, 'vw', edgeGap);
	const down = getPlacement(layout.height, 'vh', edgeGap);
	const values = {
		width: across.size,
		height: down.size,
		'padding-top': down.paddingStart,
		'padding-right': across.paddingEnd,
		'padding-bottom': down.paddingEnd,
		'padding-left': across.paddingStart,
		'anchor-x': ANCHORS[layout.anchor].x,
		'anchor-y': ANCHORS[layout.anchor].y
	};

	for (const property of PROPERTIES) {
		document.documentElement.style.setProperty(`--layout-${property}`, values[property]);
	}
}

export function removeLayout(): void {
	for (const property of PROPERTIES) {
		document.documentElement.style.removeProperty(`--layout-${property}`);
	}
}

function getPlacement(size: Size, windowUnit: 'vw' | 'vh', edgeGap: number): Placement {
	const gap = `${edgeGap}px`;

	if (typeof size === 'object') {
		const padding = getPadding(size.padding, windowUnit);
		return {
			paddingStart: `max(${gap}, ${padding.start})`,
			paddingEnd: `max(${gap}, ${padding.end})`,
			size: '100%'
		};
	}

	return {
		paddingStart: gap,
		paddingEnd: gap,
		size: `min(${getCssLength(size, windowUnit)}, 100%)`
	};
}

function getPadding(padding: Padding, windowUnit: 'vw' | 'vh'): { start: string; end: string } {
	if (typeof padding === 'object') {
		return {
			start: getCssLength(padding.start, windowUnit),
			end: getCssLength(padding.end, windowUnit)
		};
	}

	return { start: getCssLength(padding, windowUnit), end: getCssLength(padding, windowUnit) };
}

function getCssLength(length: Length, windowUnit: 'vw' | 'vh'): string {
	return typeof length === 'number' ? `${length}px` : `${length.slice(0, -1)}${windowUnit}`;
}
