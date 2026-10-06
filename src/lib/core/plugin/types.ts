import { z } from 'zod';
import type { App } from '$lib/core/app';
import type { Space } from '$lib/core/spaces/space';
import type { Plugin } from './plugin';

const idPart = z.string().regex(/^[a-z0-9-]+$/, 'use lowercase letters, digits and hyphens');

export const PluginManifestSchema = z.object({
	name: idPart,
	author: idPart
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

export type PluginModule<S extends Space | null = Space> = {
	manifest: PluginManifest;
	default: new (manifest: PluginManifest, app: App, space: S) => Plugin<S>;
};
