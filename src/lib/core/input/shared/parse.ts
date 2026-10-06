export type CommandLine = {
	trigger: string;
	args: string[];
};

export function getWords(line: string): string[] {
	const words: string[] = [];

	for (let i = 0; i < line.length; i++) {
		if (/\s/.test(line[i])) continue;

		const isQuoted = line[i] === '"';
		const start = isQuoted ? i + 1 : i;

		let end = start;
		while (end < line.length && (isQuoted ? line[end] !== '"' : !/\s/.test(line[end]))) end++;

		words.push(line.slice(start, end));
		i = end;
	}

	return words;
}

export function getCommandLine(value: string): CommandLine | null {
	if (!value.startsWith('/')) return null;

	const [trigger, ...args] = getWords(value.slice(1));
	return trigger ? { trigger, args } : null;
}

export function getTypedTrigger(value: string): string | null {
	if (!value.startsWith('/')) return null;

	const typed = value.slice(1);
	return /\s/.test(typed) ? null : typed;
}
