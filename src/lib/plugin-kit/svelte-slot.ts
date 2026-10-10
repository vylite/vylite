import { mount, unmount, type Component } from 'svelte';
import type { Mountable } from '$lib/core/ui/shared/types';

export function svelteSlot<Props extends Record<string, unknown>>(
	component: Component<Props>,
	props?: Props
): Mountable {
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
