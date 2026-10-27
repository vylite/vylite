import type { RegisteredCommand } from '$lib/core/commands/types';
import { getTypedTrigger } from './parse';

export function getSuggestions(value: string, commands: RegisteredCommand[]): RegisteredCommand[] {
	const typed = getTypedTrigger(value);
	if (typed === null) return [];

	return commands.filter((command) => command.trigger.startsWith(typed)).sort(compareCommands);
}

function compareCommands(first: RegisteredCommand, second: RegisteredCommand): number {
	const firstPriority = first.priority ?? 0;
	const secondPriority = second.priority ?? 0;

	return secondPriority - firstPriority || first.trigger.localeCompare(second.trigger);
}
