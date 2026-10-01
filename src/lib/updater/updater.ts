import { getCurrentWindow } from '@tauri-apps/api/window';
import { check, type Update } from '@tauri-apps/plugin-updater';
import type { App } from '$lib/core/app';
import { catchError } from '$lib/core/errors/catch-error';

export function startUpdater(app: App): () => void {
	if (import.meta.env.DEV) return () => {};

	let update: Update | null = null;

	void getDownloadedUpdate(app).then((downloaded) => (update = downloaded));

	const stopListening = getCurrentWindow().onCloseRequested(async () => {
		if (update) await install(app, update);
	});

	return () => void stopListening.then((stop) => stop());
}

async function getDownloadedUpdate(app: App): Promise<Update | null> {
	const [error, update] = await catchError(async () => {
		if (!app.settings.get().autoUpdate) return null;

		const update = await check();
		await update?.download();
		return update;
	});

	if (error) app.errors.report(error);
	return update ?? null;
}

async function install(app: App, update: Update): Promise<void> {
	const [error] = await catchError(async () => {
		if (app.settings.get().autoUpdate) await update.install({ restartAfterInstall: false });
	});

	if (error) app.errors.report(error);
}
