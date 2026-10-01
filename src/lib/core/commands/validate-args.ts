import { VyliteError } from '$lib/core/errors/vylite-error';
import type { Command } from './types';

export function assertValidArgs(command: Command, args: string[]): void {
	const params = command.params ?? [];
	const filled = args.filter((arg) => arg.length > 0);

	if (filled.length > params.length)
		throw new VyliteError(getArgCountMessage(command), 'COMMAND_UNEXPECTED_ARG', {
			context: { trigger: command.trigger, args }
		});

	const missing = params.filter((param) => param.required)[filled.length];

	if (missing)
		throw new VyliteError(`missing argument <${missing.placeholder}>.`, 'COMMAND_MISSING_ARG', {
			context: { trigger: command.trigger, args }
		});
}

function getArgCountMessage(command: Command): string {
	const count = command.params?.length ?? 0;

	if (count === 0) return `/${command.trigger} takes no arguments.`;
	if (count === 1) return `/${command.trigger} takes 1 argument.`;

	return `/${command.trigger} takes ${count} arguments.`;
}
