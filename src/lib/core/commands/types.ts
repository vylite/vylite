import type { Page, PageState } from '$lib/core/ui/shared/types';

export type CommandDefinition = {
	description: string;
	params?: CommandParam[];

	priority?: number;
	internal?: boolean;

	isAvailable?(state: PageState | undefined): true | string;
	run(args: string[], state: PageState | undefined): Page | void | Promise<Page | void>;
	children?: CommandTree;
};

export type CommandParam = {
	placeholder: string;
	type?: 'string';
	required?: boolean;
};

export type CommandTree = Record<string, CommandDefinition>;

export type RegisteredCommand = Omit<CommandDefinition, 'children'> & {
	id: string;
	trigger: string;
	pluginId: string;
	parentId: string | null;
};
