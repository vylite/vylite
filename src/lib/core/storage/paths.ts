import { appConfigDir, join } from '@tauri-apps/api/path';

export function getAppFolder(): Promise<string> {
	return appConfigDir();
}

export async function getSpacesFile(): Promise<string> {
	return join(await getAppFolder(), 'spaces.json');
}

export async function getSettingsFile(): Promise<string> {
	return join(await getAppFolder(), 'settings.json');
}
