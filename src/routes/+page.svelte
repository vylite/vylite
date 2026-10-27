<script lang="ts">
	import { app } from '$lib/core/app';
	import RenderFailed from '$lib/components/RenderFailed.svelte';
	import Slot from '$lib/components/Slot.svelte';

	const { root, twig, overlay, pages } = app.ui;
	const crumbs = $derived(
		pages
			.getAll()
			.filter((openPage) => openPage.page.label)
			.slice(-2)
	);
</script>

<div class="app" data-home={pages.isHome()}>
	<div class="app-workspace">
		<div class="app-hub">
			<div class="app-slit">
				{#each crumbs as openPage (openPage)}
					<div class="app-crumb" data-last={openPage === crumbs.at(-1)}>
						<span class="app-crumb-text">{openPage.page.label}</span>
					</div>
				{/each}

				<div class="slot slot-root">
					{#each root.getAll() as view (view)}
						<Slot content={view.content} hidden={view !== root.getTop()} />
					{/each}
				</div>
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

	<div class="slot-overlay">
		{#each overlay.getAll() as view (view)}
			<Slot content={view.content} hidden={!overlay.getVisible().includes(view)} />
		{/each}
	</div>
</div>
