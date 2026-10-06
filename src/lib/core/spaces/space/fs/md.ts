import { CORE_SCHEMA, dump } from 'js-yaml';
import { VyliteError } from '$lib/core/errors/vylite-error';
import { getMarkdown, type Frontmatter, type Markdown } from '../shared/markdown';
import type { SpaceFs } from '.';

export class SpaceMd {
	constructor(private readonly _fs: SpaceFs) {}

	async read(path: string): Promise<Markdown> {
		return getMarkdown(await this._fs.read(path));
	}

	async writeBody(path: string, body: string): Promise<void> {
		if (!(await this._fs.exists(path))) {
			await this._fs.write(path, `---\ncreated_at: ${new Date().toISOString()}\n---\n${body}`);
			return;
		}

		const text = await this._fs.read(path);
		const keptFrontmatter = text.slice(0, text.length - getMarkdown(text).body.length);

		await this._fs.write(path, keptFrontmatter + body);
	}

	async updateFrontmatter(
		path: string,
		change: (frontmatter: Frontmatter) => Frontmatter
	): Promise<void> {
		const { frontmatter, body } = getMarkdown(await this._fs.read(path));

		if (!frontmatter)
			throw new VyliteError('frontmatter is not valid YAML.', 'SPACE_FRONTMATTER_INVALID', {
				context: { path }
			});

		const changed = change(frontmatter);
		const isEmpty = Object.keys(changed).length === 0;
		const frontmatterText = isEmpty ? '' : `---\n${dump(changed, { schema: CORE_SCHEMA })}---\n`;

		await this._fs.write(path, frontmatterText + body);
	}
}
