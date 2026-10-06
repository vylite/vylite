import type { Space } from './space';

export class ActiveSpace {
	private _space = $state.raw<Space | null>(null);

	get(): Space | null {
		return this._space;
	}

	set(space: Space | null): void {
		this._space = space;
	}
}
