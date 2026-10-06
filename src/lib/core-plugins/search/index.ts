import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import { HomeSearch } from './search.svelte';
import Search from './Search.svelte';

export const manifest: PluginManifest = { name: 'search', author: 'vylite' };

export default class SearchPlugin extends Plugin {
	onload(): void {
		const { pages, twig } = this.app.ui;
		const { element } = this.app.input;
		let remove: (() => void) | undefined;

		this.addCleanup(() => remove?.());

		const search = new HomeSearch(this.app, this.space);
		this.watch(
			() => element.getValue(),
			() => search.list.select(0)
		);

		this.watch(
			() =>
				pages.isHome() && element.getValue().trim() !== '' && !element.getValue().startsWith('/'),
			(isShown) => {
				if (isShown === (remove !== undefined)) return;

				remove?.();
				remove = undefined;
				if (!isShown) return;

				const view = {
					content: svelteSlot(Search, { app: this.app, search }),
					onKeydown: (event: KeyboardEvent) => search.list.onKeydown(event)
				};
				remove = twig.set(view);
			}
		);
	}
}
