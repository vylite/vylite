import { CORE_SCHEMA, load } from 'js-yaml';

export type Frontmatter = Record<string, unknown>;

export type Markdown = {
	frontmatter: Frontmatter | null;
	body: string;
};

const FRONTMATTER_BLOCK = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

export function getMarkdown(text: string): Markdown {
	const match = text.match(FRONTMATTER_BLOCK);
	if (!match) return { frontmatter: {}, body: text };

	return { frontmatter: getFrontmatter(match[1]), body: text.slice(match[0].length) };
}

function getFrontmatter(yaml: string): Frontmatter | null {
	if (yaml.trim() === '') return {};

	try {
		const parsed = load(yaml, { schema: CORE_SCHEMA });
		const isObject = parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed);

		return isObject ? (parsed as Frontmatter) : null;
	} catch {
		return null;
	}
}
