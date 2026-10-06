import { VyliteError } from '$lib/core/errors/vylite-error';
import type { SpaceFs } from '$lib/core/spaces/space/fs';

const NAME_FORBIDDEN = /[\\/:*?"<>|]/;

export async function createNote(fs: SpaceFs, title: string): Promise<void> {
	if (NAME_FORBIDDEN.test(title))
		throw new VyliteError('a note name cannot contain \\ / : * ? " < > |', 'NOTE_NAME_INVALID');

	await fs.md.writeBody(await getFreePath(fs, title), '');
}

async function getFreePath(fs: SpaceFs, title: string): Promise<string> {
	let path = `${title}.md`;
	for (let n = 2; await fs.exists(path); n++) {
		path = `${title} ${n}.md`;
	}

	return path;
}
