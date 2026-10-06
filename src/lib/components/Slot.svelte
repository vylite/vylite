<script lang="ts">
	import type { SlotContent } from '$lib/core/ui/shared/types';
	import './Slot.scss';

	let {
		content,
		slot,
		hidden = false
	}: { content: SlotContent | null; slot?: string; hidden?: boolean } = $props();

	let el = $state<HTMLElement>();

	$effect(() => {
		const mounted = content;
		if (!mounted || !el) return;

		mounted.mount(el);
		return () => mounted.unmount?.();
	});
</script>

{#if content}
	<div class="slot-content" bind:this={el} data-slot={slot} {hidden}></div>
{/if}
