import { SvelteMap } from 'svelte/reactivity';
import type { App } from '$lib/core/app';
import { VyliteError } from '$lib/core/errors/vylite-error';
import type { Command } from './types';
import { assertValidArgs } from './validate-args';

export class CommandRegistry {
	private readonly _commands = new SvelteMap<string, Command>();

	constructor(private readonly _app: App) {}

	register(command: Command): () => void {
		if (this._commands.has(command.trigger))
			throw new VyliteError('command trigger already registered.', 'COMMAND_TRIGGER_CONFLICT', {
				context: { trigger: command.trigger }
			});

		this._commands.set(command.trigger, command);

		return () => {
			this._commands.delete(command.trigger);
		};
	}

	async run(trigger: string, args: string[] = []): Promise<void> {
		const command = this._resolve(trigger);
		if (!command)
			throw new VyliteError('command not found.', 'COMMAND_NOT_FOUND', { context: { trigger } });

		assertValidArgs(command, args);

		const page = await command.run(args);
		if (page) this._app.ui.pages.open({ command, args, page });
	}

	get(trigger: string): Command | undefined {
		return this._commands.get(trigger);
	}

	getAll(): Command[] {
		return [...this._commands.values()];
	}

	getAvailable(): Command[] {
		const active = this._app.ui.pages.getActive();
		if (!active) return this.getAll();

		return active.page.commands ?? [];
	}

	private _resolve(trigger: string): Command | undefined {
		const available = this.getAvailable().find((command) => command.trigger === trigger);
		if (available) return available;

		const command = this._commands.get(trigger);
		return command?.internal ? command : undefined;
	}
}
