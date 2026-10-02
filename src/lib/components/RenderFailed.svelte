<script lang="ts">
	import { app } from '$lib/core/app';
	import './RenderFailed.scss';

	let { reset }: { reset: () => void } = $props();

	const brokenPage = app.ui.pages.getActive();

	$effect(() => {
		if (brokenPage && !app.ui.pages.getAll().includes(brokenPage)) reset();
	});
</script>

<div class="render-failed">
	<span>Looks like something went wrong...</span>
</div>
