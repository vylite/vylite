import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import { HomeSearch } from './search.svelte';
import Search from './Search.svelte';

export const manifest: PluginManifest = { name: 'search', author: 'vylite' };

export default class SearchPlugin extends Plugin {
	onload(): void {
		const { element } = this.app.input;

		const search = new HomeSearch(this.app, this.space);
		this.watch(
			() => element.getValue(),
			() => search.list.select(0)
		);

		const view = {
			content: svelteSlot(Search, { app: this.app, search }),
			onKeydown: (event: KeyboardEvent) => search.list.onKeydown(event),
			isHidden: () => element.getValue().trim() === '' || element.getValue().startsWith('/')
		};
		this.addCleanup(this.app.ui.twig.set(view));
	}
}
