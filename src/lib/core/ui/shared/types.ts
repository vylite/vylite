import type { Command } from '$lib/core/commands/types';

export type SlotContent = {
	mount: (el: HTMLElement) => void;
	unmount?: () => void;
};

export type View = {
	content: SlotContent;
	onKeydown?: (event: KeyboardEvent) => void;
};

export type Layout = 'normal' | 'tall' | 'full';

export type Page = {
	label?: string;
	layout?: Layout;

	nest: View;
	commands?: Command[];
};

export type OpenPage = {
	command: Command;
	args: string[];
	page: Page;
};

export type RailWindow = {
	title: string;
	content: SlotContent;
};

export type RailEntry = RailWindow & {
	openPage: OpenPage | null;
};
