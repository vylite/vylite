import type { Command } from '$lib/core/commands/types';
import { getTypedTrigger } from './parse';

export function getSuggestions(value: string, commands: Command[]): Command[] {
	const typed = getTypedTrigger(value);
	if (typed === null) return [];

	return commands.filter((command) => command.trigger.startsWith(typed)).sort(compareCommands);
}

function compareCommands(first: Command, second: Command): number {
	const firstRank = first.rank ?? Number.MAX_SAFE_INTEGER;
	const secondRank = second.rank ?? Number.MAX_SAFE_INTEGER;

	return firstRank - secondRank || first.trigger.localeCompare(second.trigger);
}
