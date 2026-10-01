import type { PluginModule } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/space/space';

export const APP_PLUGINS: PluginModule<Space | null>[] = [];
export const SPACE_PLUGINS: PluginModule[] = [];
