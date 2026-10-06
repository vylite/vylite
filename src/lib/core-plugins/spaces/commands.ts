import { documentDir, join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { mkdir } from '@tauri-apps/plugin-fs';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import type { App } from '$lib/core/app';
import type { Command } from '$lib/core/commands/types';
import type { SpaceEntry } from '$lib/core/spaces/shared/saved-list';
import type { RovingList } from '$lib/plugin-kit/roving-list.svelte';

export function getStartCommand(app: App): Command {
	return {
		trigger: 'start',
		description: 'make a space in Documents/vylite',
		run: async () => {
			const path = await join(await documentDir(), 'vylite');

			await mkdir(path, { recursive: true });
			await app.spaces.switcher.open(path);
		}
	};
}

export function getPickCommand(app: App): Command {
	return {
		trigger: 'pick',
		description: 'add a folder',
		run: async () => {
			const path = await open({
				directory: true,
				multiple: false,
				recursive: true,
				title: 'select space folder'
			});

			if (path) await app.spaces.switcher.open(path);
		}
	};
}

export function getForgetCommand(app: App, list: RovingList<SpaceEntry>): Command {
	return {
		trigger: 'forget',
		description: 'remove from this list',
		run: async () => {
			const entry = list.getSelected();

			if (entry) await app.spaces.registry.forgetSpace(entry);
		}
	};
}

export function getRevealCommand(list: RovingList<SpaceEntry>): Command {
	return {
		trigger: 'reveal',
		description: 'show in file manager',
		run: async () => {
			const entry = list.getSelected();

			if (entry) await revealItemInDir(entry.path);
		}
	};
}
