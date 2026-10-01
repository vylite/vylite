<script lang="ts">
	import { onMount } from 'svelte';
	import { app } from '$lib/core/app';
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/tokens.css';
	import Titlebar from '$lib/components/Titlebar.svelte';
	import { init, initState } from '$lib/core/init.svelte';
	import { startUpdater } from '$lib/updater/updater';

	let { children } = $props();

	onMount(() => init(app));

	$effect(() => {
		if (initState.ready) return startUpdater(app);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Titlebar />

{@render children()}
