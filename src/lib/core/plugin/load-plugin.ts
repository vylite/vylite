import { catchError } from '$lib/core/errors/catch-error';
import type { ErrorReporter } from '$lib/core/errors/reporter';
import { VyliteError } from '$lib/core/errors/vylite-error';
import type { Space } from '$lib/core/space/space';
import type { Plugin } from './plugin';
import { PluginManifestSchema } from './types';

export async function loadPlugin(
	plugin: Plugin<Space | null>,
	errors: ErrorReporter
): Promise<void> {
	const manifest = PluginManifestSchema.safeParse(plugin.manifest);
	if (!manifest.success)
		throw new VyliteError('invalid plugin manifest.', 'PLUGIN_MANIFEST_INVALID', {
			cause: manifest.error,
			context: { manifest: plugin.manifest }
		});

	const [error] = await catchError(() => plugin.load());
	if (!error) return;

	const [unloadError] = await catchError(() => unloadPlugin(plugin));
	if (unloadError) errors.report(unloadError);

	throw new VyliteError('failed to load plugin.', 'PLUGIN_LOAD_FAILED', {
		cause: error,
		context: { id: plugin.id }
	});
}

export async function unloadPlugin(plugin: Plugin<Space | null>): Promise<void> {
	const [error] = await catchError(() => plugin.unload());
	if (error)
		throw new VyliteError('failed to unload plugin.', 'PLUGIN_UNLOAD_FAILED', {
			cause: error,
			context: { id: plugin.id }
		});
}
