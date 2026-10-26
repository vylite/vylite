import { SvelteMap } from 'svelte/reactivity';
import type { App } from '$lib/core/app';
import { VyliteError } from '$lib/core/errors/vylite-error';
import { getFlattenedCommands } from './tree';
import type { CommandTree, RegisteredCommand } from './types';
import { assertValidArgs } from './validate-args';

export class CommandRegistry {
	private readonly _commands = new SvelteMap<string, RegisteredCommand>();

	constructor(private readonly _app: App) {}

	register(pluginId: string, tree: CommandTree): () => void {
		const added: RegisteredCommand[] = [];
		const refused = new Set<string>();

		for (const command of getFlattenedCommands(pluginId, tree)) {
			if (command.parentId !== null && refused.has(command.parentId)) {
				refused.add(command.id);
				continue;
			}

			const isTriggerTaken = this.getAll().some(
				(registered) =>
					registered.parentId === command.parentId && registered.trigger === command.trigger
			);

			if (isTriggerTaken) {
				refused.add(command.id);
				this._app.errors.report(
					new VyliteError('command trigger already registered.', 'COMMAND_TRIGGER_CONFLICT', {
						context: { id: command.id }
					})
				);
				continue;
			}

			this._commands.set(command.id, command);
			added.push(command);
		}

		return () => {
			for (const command of added) this._commands.delete(command.id);
		};
	}

	async run(trigger: string, args: string[] = []): Promise<void> {
		const command =
			this.getAvailable().find((available) => available.trigger === trigger) ??
			this.getAll().find(
				(registered) =>
					registered.internal && registered.parentId === null && registered.trigger === trigger
			);

		if (!command)
			throw new VyliteError('command not found.', 'COMMAND_NOT_FOUND', { context: { trigger } });

		const reason = this.getUnavailableReason(command);
		if (reason)
			throw new VyliteError(reason, 'COMMAND_UNAVAILABLE', { context: { id: command.id } });

		assertValidArgs(command, args);

		const state =
			command.parentId === null ? undefined : this._app.ui.pages.getActive()?.page.state;

		const page = await command.run(args, state);
		if (page) this._app.ui.pages.open({ command, args, page });
	}

	get(id: string): RegisteredCommand | undefined {
		return this._commands.get(id);
	}

	getAll(): RegisteredCommand[] {
		return [...this._commands.values()];
	}

	getAvailable(): RegisteredCommand[] {
		const parentId = this._app.ui.pages.getActive()?.command.id ?? null;
		return this.getAll().filter((command) => command.parentId === parentId);
	}

	getUnavailableReason(command: RegisteredCommand): string | undefined {
		if (!command.isAvailable) return undefined;

		const state =
			command.parentId === null ? undefined : this._app.ui.pages.getActive()?.page.state;

		try {
			const result = command.isAvailable(state);
			return result === true ? undefined : result;
		} catch (error) {
			this._app.errors.report(
				new VyliteError('isAvailable threw an error.', 'COMMAND_AVAILABILITY_FAILED', {
					cause: error,
					context: { id: command.id }
				})
			);
			return 'this command cannot run now.';
		}
	}
}
