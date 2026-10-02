import { on } from 'svelte/events';
import type { App } from '$lib/core/app';
import { catchError } from '$lib/core/errors/catch-error';

export const initState = $state({ ready: false });

export function init(app: App): () => void {
	const stopErrors = on(window, 'error', (event) =>
		app.errors.report(event.error ?? event.message)
	);
	const stopRejections = on(window, 'unhandledrejection', (event) =>
		app.errors.report(event.reason)
	);
	const stopKeys = app.ui.keys.listen();

	void start(app);

	return () => {
		stopErrors();
		stopRejections();
		stopKeys();
	};
}

async function start(app: App): Promise<void> {
	const [error] = await catchError(async () => {
		await app.settings.load();
		await app.spaces.registry.load();

		const [latest] = app.spaces.registry.getAll();
		if (latest) await app.spaces.switcher.open(latest.path);
	});

	if (error) app.errors.report(error);
	if (!app.spaces.switcher.getActive()) await app.plugins.loadAppPlugins(null);

	initState.ready = true;
}
