import type { CommandParam, RegisteredCommand } from '$lib/core/commands/types';
import { getTypedTrigger, getWords } from './parse';

export function getGhost(
	value: string,
	suggestion: RegisteredCommand | undefined,
	command: RegisteredCommand | undefined
): string {
	const tail = getTriggerTail(value, suggestion);
	if (suggestion && tail) {
		return tail + getArgHint(`/${suggestion.trigger}`, suggestion.params ?? []);
	}

	return getArgHint(value, command?.params ?? []);
}

export function getTriggerTail(value: string, suggestion: RegisteredCommand | undefined): string {
	const typed = getTypedTrigger(value);
	if (!suggestion || typed === null) return '';

	return suggestion.trigger.slice(typed.length);
}

function getArgHint(value: string, params: CommandParam[]): string {
	const words = getWords(value.slice(1));
	const remaining = params.slice(Math.max(words.length - 1, 0));
	if (!remaining.length) return '';

	const separator = /\s$/.test(value) ? '' : ' ';
	return separator + remaining.map((param) => `<${param.placeholder}>`).join(' ');
}
