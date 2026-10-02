import { mount, unmount, type Component } from 'svelte';
import type { SlotContent } from '$lib/core/ui/types';

export function svelteSlot<Props extends Record<string, unknown>>(
	component: Component<Props>,
	props?: Props
): SlotContent {
	let instance: Record<string, unknown> | undefined;

	return {
		mount: (el: HTMLElement) => {
			instance = mount(component, { target: el, props: props ?? ({} as Props) });
		},
		unmount: () => {
			if (instance) unmount(instance);
		}
	};
}
