import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Suggestions from './Suggestions.svelte';
import SuggestionsPopup from './SuggestionsPopup.svelte';

export const manifest: PluginManifest = { name: 'suggestions', author: 'vylite' };

export default class SuggestionsPlugin extends Plugin<Space | null> {
	onload(): void {
		const { pages, twig, overlay } = this.app.ui;
		const { suggestions } = this.app.input;

		const listView = {
			content: svelteSlot(Suggestions, { app: this.app }),
			isHidden: () => suggestions.getAll().length === 0
		};
		this.addCleanup(twig.set(listView));

		const popupView = {
			content: svelteSlot(SuggestionsPopup, { app: this.app }),
			isHidden: () => suggestions.getAll().length === 0 || pages.isHome()
		};
		this.addCleanup(overlay.set(popupView));
	}
}
