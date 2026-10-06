import type { App } from '$lib/core/app';
import type { Command } from '$lib/core/commands/types';
import { catchError } from '$lib/core/errors/catch-error';
import { getCommandLine } from './shared/parse';
import type { InputController } from '.';

export class InputDispatcher {
	constructor(
		private readonly _app: App,
		private readonly _input: InputController
	) {}

	getAll(): Command[] {
		return this._app.commands.getAvailable().filter((command) => !command.internal);
	}

	getLineCommand(): Command | undefined {
		const line = getCommandLine(this._input.element.getValue());
		if (!line) return undefined;

		return this.getAll().find((command) => command.trigger === line.trigger);
	}

	openCommandLine(): void {
		if (this.getAll().length === 0) {
			this._input.messages.setError({
				message: 'no commands on this page.',
				code: 'INPUT_NO_COMMANDS'
			});
			return;
		}

		this._input.element.setValue('/');
		this._input.element.focus();
	}

	complete(): void {
		const suggestion = this._input.suggestions.getSelected();
		if (!suggestion) return;

		const completed = `/${suggestion.trigger}`;

		if (suggestion.params?.length)
			this._input.element.setValue(`${completed} ""`, completed.length + 2);
		else this._input.element.setValue(completed);
	}

	async submit(): Promise<void> {
		const suggestion = this._input.suggestions.getSelected();

		if (suggestion?.params?.some((param) => param.required)) {
			this.complete();
			return;
		}

		if (suggestion) {
			await this.run(suggestion.trigger);
			return;
		}

		const line = getCommandLine(this._input.element.getValue());
		if (!line) return;

		if (!this.getLineCommand()) {
			this._input.messages.setError({ message: 'command not found.', code: 'COMMAND_NOT_FOUND' });
			return;
		}

		await this.run(line.trigger, line.args);
	}

	async run(trigger: string, args: string[] = []): Promise<void> {
		const [error] = await catchError(() => this._app.commands.run(trigger, args));

		if (error) {
			this._input.messages.setError(this._app.errors.report(error));
			return;
		}

		this._input.element.setValue('');
		this._input.element.blur();
	}
}
