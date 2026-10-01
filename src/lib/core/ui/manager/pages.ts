import { VyliteError } from '$lib/core/errors/vylite-error';
import type { UiManager } from '.';
import { reactiveList } from '../reactive-list.svelte';
import type { OpenPage, Page } from '../types';

export class UiPages {
	private readonly _pages = reactiveList<OpenPage>();

	constructor(private readonly _ui: UiManager) {}

	open(openPage: OpenPage): void {
		assertUniqueTriggers(openPage.page);
		this._pages.add(openPage);
	}

	close(): void {
		this._pages.removeLast();
		this._ui.rail.removeClosed();
	}

	closeAll(): void {
		this._pages.clear();
		this._ui.rail.removeClosed();
	}

	getActive(): OpenPage | null {
		return this._pages.getAll().at(-1) ?? null;
	}

	getAll(): readonly OpenPage[] {
		return this._pages.getAll();
	}

	isHome(): boolean {
		return this._pages.getAll().length === 0;
	}
}

function assertUniqueTriggers(page: Page): void {
	const triggers = (page.commands ?? []).map((command) => command.trigger);
	const duplicate = triggers.find((trigger, i) => triggers.indexOf(trigger) !== i);

	if (duplicate)
		throw new VyliteError('duplicate page command trigger.', 'PAGE_COMMAND_TRIGGER_CONFLICT', {
			context: { trigger: duplicate, page: page.label }
		});
}
