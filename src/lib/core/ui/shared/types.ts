import type { ScreenLayout } from '$lib/core/appearance/schema';
import type { RegisteredCommand } from '$lib/core/commands/types';

export type Mountable = {
	mount: (el: HTMLElement) => void;
	unmount?: () => void;
};

export type View = {
	content: Mountable;
	onKeydown?: (event: KeyboardEvent) => void;
	isHidden?: () => boolean;
};

export type PageState = Record<string, unknown>;

export type Page = {
	label?: string;
	layout?: Partial<ScreenLayout>;

	nest: View;
	state?: PageState;
	getSelection?: () => string | null;
};

export type OpenPage = {
	command: RegisteredCommand;
	args: string[];
	page: Page;
};
