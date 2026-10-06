import { on } from 'svelte/events';
import type { App } from '$lib/core/app';
import { isTextField } from './text-field';

export class KeyRouter {
	constructor(private readonly _app: App) {}

	listen(): () => void {
		return on(window, 'keydown', (event) => this._onKeydown(event));
	}

	private _onKeydown(event: KeyboardEvent): void {
		if (isTextField(event.target)) return;

		const { overlay, pages, root } = this._app.ui;
		const isPlainEscape =
			event.key === 'Escape' && !event.ctrlKey && !event.metaKey && !event.altKey;

		if (isPlainEscape && overlay.get()) {
			event.preventDefault();
			overlay.close();
			return;
		}

		this.passToViews(event);
		if (event.defaultPrevented) return;

		root.getTop()?.onKeydown?.(event);
		if (event.defaultPrevented) return;

		if (isPlainEscape && !pages.isHome()) {
			event.preventDefault();
			pages.close();
		}
	}

	passToViews(event: KeyboardEvent): void {
		const { overlay, pages, twig } = this._app.ui;

		for (const view of [overlay.get(), pages.getActive()?.page.nest, twig.getTop()]) {
			view?.onKeydown?.(event);
			if (event.defaultPrevented) return;
		}
	}
}
