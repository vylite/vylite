<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import type { App } from '$lib/core/app';
	import Suggestions from './Suggestions.svelte';
	import './SuggestionsPopup.scss';

	let { app }: { app: App } = $props();

	const place: Attachment<HTMLElement> = (popup) => {
		const hub = document.querySelector('.app-hub');
		const input = app.input.element.getElement();
		if (!hub || !input) return;

		const update = () => {
			const hubBox = hub.getBoundingClientRect();
			const typedLeft =
				input.getBoundingClientRect().left + parseFloat(getComputedStyle(input).paddingLeft);
			const trigger = popup.querySelector('.suggestions-trigger');
			const triggerOffset = trigger
				? trigger.getBoundingClientRect().left - popup.getBoundingClientRect().left
				: 0;

			popup.style.left = `${typedLeft - triggerOffset}px`;
			popup.style.setProperty('--hub-top', `${hubBox.top}px`);
			popup.style.setProperty('--hub-bottom', `${hubBox.bottom}px`);

			popup.dataset.side = 'above';
			if (popup.getBoundingClientRect().top < 0) popup.dataset.side = 'below';
		};

		const observer = new ResizeObserver(update);
		observer.observe(popup);
		observer.observe(hub);
		observer.observe(input);
		const removeResize = on(window, 'resize', update);

		return () => {
			observer.disconnect();
			removeResize();
		};
	};
</script>

<div class="suggestions-popup" {@attach place}>
	<Suggestions {app} />
</div>
