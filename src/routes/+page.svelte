<script lang="ts">
	import { app } from '$lib/core/app';
	import RenderFailed from '$lib/components/RenderFailed.svelte';
	import Slot from '$lib/components/Slot.svelte';

	const { root, twig, overlay, pages, rail } = app.ui;
</script>

<div
	class="app"
	data-layout={pages.getActive()?.page.layout ?? 'normal'}
	data-home={pages.isHome()}
>
	<div class="app-workspace">
		<div class="app-hub">
			<div class="slot slot-root">
				{#each root.getAll() as view (view)}
					<Slot content={view.content} hidden={view !== root.getTop()} />
				{/each}
			</div>

			<div class="slot slot-twig">
				{#each twig.getAll() as view (view)}
					<Slot content={view.content} hidden={view !== twig.getTop()} />
				{/each}
			</div>
		</div>

		<div class="slot slot-nest">
			<svelte:boundary onerror={(error) => app.errors.report(error)}>
				{#each pages.getAll() as openPage (openPage)}
					<Slot content={openPage.page.nest.content} hidden={openPage !== pages.getActive()} />
				{/each}

				{#snippet failed(_error, reset)}
					<RenderFailed {reset} />
				{/snippet}
			</svelte:boundary>
		</div>
	</div>

	<div class="slot-rail">
		{#each rail.getVisible() as item (item)}
			<div class="slot-rail-item">
				<div class="slot-rail-title">{item.title}</div>
				<Slot content={item.content} />
			</div>
		{/each}
	</div>

	<div class="slot-overlay">
		<Slot content={overlay.get()?.content ?? null} />
	</div>
</div>
