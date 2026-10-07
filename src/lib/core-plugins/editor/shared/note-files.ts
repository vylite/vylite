import { sep } from '@tauri-apps/api/path';
import { VyliteError } from '$lib/core/errors/vylite-error';
import type { SpaceFs } from '$lib/core/spaces/space/fs';

export const UNTITLED = 'untitled';

const NAME_FORBIDDEN = /[\\/:*?"<>|]/;
const TITLE_MAX = 100;

export async function createNote(fs: SpaceFs, title: string): Promise<string> {
	if (NAME_FORBIDDEN.test(title))
		throw new VyliteError('a note name cannot contain \\ / : * ? " < > |', 'NOTE_NAME_INVALID');

	const path = await getFreePath(fs, title);
	await fs.md.writeBody(path, '');

	return path;
}

export async function renameToFirstLine(fs: SpaceFs, path: string, body: string): Promise<void> {
	const firstLine = body.split('\n').find((line) => line.trim() !== '') ?? '';
	const title = firstLine
		.replace(/^\s*#{1,6}(\s+|$)/, '')
		.replace(new RegExp(NAME_FORBIDDEN, 'g'), '')
		.replace(/^\.+/, '')
		.trim()
		.slice(0, TITLE_MAX)
		.trim();

	const folder = path.slice(0, path.lastIndexOf(sep()) + 1);

	if (!title || `${folder}${title}.md` === path) return;

	await fs.rename(path, await getFreePath(fs, folder + title));
}

async function getFreePath(fs: SpaceFs, pathWithoutExtension: string): Promise<string> {
	let path = `${pathWithoutExtension}.md`;
	for (let n = 2; await fs.exists(path); n++) {
		path = `${pathWithoutExtension} ${n}.md`;
	}

	return path;
}
