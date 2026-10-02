<script lang="ts">
	import { onMount } from 'svelte';
	import { app } from '$lib/core/app';
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource/jetbrains-mono/400.css';
	import '@fontsource/jetbrains-mono/400-italic.css';
	import '@fontsource/jetbrains-mono/700.css';
	import '@fontsource/jetbrains-mono/700-italic.css';
	import '@fontsource/jetbrains-mono/800.css';
	import '@fontsource/jetbrains-mono/800-italic.css';
	import '$lib/styles/app.scss';
	import '$lib/styles/fonts.scss';
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
