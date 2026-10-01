import { z } from 'zod';

export const SettingsSchema = z.object({
	autoUpdate: z.boolean().catch(true)
});

export type Settings = z.infer<typeof SettingsSchema>;
