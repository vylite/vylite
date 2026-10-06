import type { Page } from '$lib/core/ui/shared/types';

export type CommandParam = {
	placeholder: string;
	type?: 'string';
	required?: boolean;
};

export type Command = {
	trigger: string;
	description: string;
	params?: CommandParam[];

	rank?: number;
	internal?: boolean;

	run: (args: string[]) => Page | undefined | Promise<Page | undefined>;
};
