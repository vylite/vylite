import type { CommandTree, RegisteredCommand } from './types';

export function getFlattenedCommands(
	pluginId: string,
	tree: CommandTree,
	parentId: string | null = null
): RegisteredCommand[] {
	return Object.entries(tree).flatMap(([trigger, definition]) => {
		const { children, ...fields } = definition;
		const id = `${parentId ?? pluginId}.${trigger}`;
		const command: RegisteredCommand = { ...fields, id, trigger, pluginId, parentId };

		return [command, ...getFlattenedCommands(pluginId, children ?? {}, id)];
	});
}
