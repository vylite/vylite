import type { WatchEvent } from '@tauri-apps/plugin-fs';

export type SpaceChange =
	| { type: 'create'; path: string }
	| { type: 'modify'; path: string }
	| { type: 'remove'; path: string }
	| { type: 'rename'; path: string; from: string }
	| { type: 'unknown' };

export function getSpaceChanges(root: string, event: WatchEvent): SpaceChange[] {
	if (typeof event.type !== 'object') return [{ type: 'unknown' }];
	if ('access' in event.type) return [];

	const paths = event.paths.map((path) => path.slice(root.length + 1));

	if ('create' in event.type) return paths.map((path) => ({ type: 'create', path }));
	if ('remove' in event.type) return paths.map((path) => ({ type: 'remove', path }));

	const modify = event.type.modify;
	if (modify.kind !== 'rename') return paths.map((path) => ({ type: 'modify', path }));

	if (modify.mode === 'both') return [{ type: 'rename', from: paths[0], path: paths[1] }];
	if (modify.mode === 'from') return paths.map((path) => ({ type: 'remove', path }));
	if (modify.mode === 'to') return paths.map((path) => ({ type: 'create', path }));

	return [{ type: 'unknown' }];
}
