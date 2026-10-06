import { Plugin } from '$lib/core/plugin/plugin';
import type { PluginManifest } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import { svelteSlot } from '$lib/plugin-kit/svelte-slot';
import Suggestions from './Suggestions.svelte';
import SuggestionsPopup from './SuggestionsPopup.svelte';

export const manifest: PluginManifest = { name: 'suggestions', author: 'vylite' };

type Place = 'twig' | 'overlay' | null;

export default class SuggestionsPlugin extends Plugin<Space | null> {
	onload(): void {
		const { pages, twig, overlay } = this.app.ui;
		const { suggestions } = this.app.input;

		let shown: Place = null;
		let remove: (() => void) | undefined;

		this.addCleanup(() => remove?.());
		this.watch(
			(): Place => {
				if (suggestions.getAll().length === 0) return null;
				return pages.isHome() ? 'twig' : 'overlay';
			},
			(place) => {
				if (place === shown) return;

				remove?.();
				remove = undefined;
				shown = place;

				if (place === 'twig') {
					const listView = { content: svelteSlot(Suggestions, { app: this.app }) };
					remove = twig.set(listView);
				}
				if (place === 'overlay') {
					const popupView = { content: svelteSlot(SuggestionsPopup, { app: this.app }) };
					remove = overlay.set(popupView);
				}
			}
		);
	}
}
