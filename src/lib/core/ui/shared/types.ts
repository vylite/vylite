import type { RegisteredCommand } from '$lib/core/commands/types';

export type Mountable = {
	mount: (el: HTMLElement) => void;
	unmount?: () => void;
};

export type View = {
	content: Mountable;
	onKeydown?: (event: KeyboardEvent) => void;
};

export type Layout = 'normal' | 'tall' | 'full';

export type PageState = Record<string, unknown>;

export type Page = {
	label?: string;
	layout?: Layout;

	nest: View;
	state?: PageState;
	getSelection?: () => string | null;
};

export type OpenPage = {
	command: RegisteredCommand;
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
