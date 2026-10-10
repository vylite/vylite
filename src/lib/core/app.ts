import { AppAppearance } from './appearance/appearance.svelte';
import { CommandRegistry } from './commands/registry';
import { ErrorReporter } from './errors/reporter';
import { InputController } from './input';
import { KeyRouter } from './keys/router';
import { PluginManager } from './plugin/manager';
import { AppSettings } from './settings/settings.svelte';
import { Spaces } from './spaces';
import { UiManager } from './ui';

export class App {
	readonly errors = new ErrorReporter();
	readonly settings = new AppSettings(this);
	readonly appearance = new AppAppearance(this);
	readonly ui = new UiManager();
	readonly spaces = new Spaces(this);
	readonly commands = new CommandRegistry(this);
	readonly input = new InputController(this);
	readonly keys = new KeyRouter(this);
	readonly plugins = new PluginManager(this);
}

export const app = new App();
