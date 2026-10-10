import type { Command } from '$lib/core/commands/types';

export type Mountable = {
	mount: (el: HTMLElement) => void;
	unmount?: () => void;
};

export type View = {
	content: Mountable;
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

export type RailWindow = View & {
	title: string;
	focused?: false;
	onKeydown?: never;
};

export type FocusedRailWindow = View & {
	title: string;
	focused: true;
};

export type RailEntry = (RailWindow | FocusedRailWindow) & {
	openPage: OpenPage | null;
};
