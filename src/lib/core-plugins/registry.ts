import type { PluginModule } from '$lib/core/plugin/types';
import type { Space } from '$lib/core/spaces/space';
import * as about from './about';
import * as appearance from './appearance';
import * as community from './community';
import * as editor from './editor';
import * as help from './help';
import * as input from './input';
import * as notes from './notes';
import * as search from './search';
import * as settings from './settings';
import * as spaces from './spaces';
import * as suggestions from './suggestions';
import * as themes from './themes';
import * as twigHive from './twig-hive';
import * as welcome from './welcome';

export const APP_PLUGINS: PluginModule<Space | null>[] = [
	input,
	suggestions,
	welcome,
	spaces,
	about,
	help,
	community,
	themes,
	appearance,
	settings
];
export const SPACE_PLUGINS: PluginModule[] = [search, notes, editor, twigHive];
