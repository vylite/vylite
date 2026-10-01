import { CommandRegistry } from './commands/registry';
import { ErrorReporter } from './errors/reporter';
import { InputController } from './input/controller';
import { PluginManager } from './plugin/manager';
import { AppSettings } from './settings/settings.svelte';
import { SpaceManager } from './space/manager';
import { UiManager } from './ui/manager';

export class App {
	readonly errors = new ErrorReporter();
	readonly settings = new AppSettings(this);
	readonly ui = new UiManager();
	readonly spaces = new SpaceManager(this);
	readonly commands = new CommandRegistry(this);
	readonly input = new InputController(this);
	readonly plugins = new PluginManager(this);
}

export const app = new App();
