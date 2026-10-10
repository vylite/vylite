import { z } from 'zod';

export const AppearanceSchema = z.object({
	theme: z.string().catch('rosepine'),
	borderWidth: z.number().int().min(0).catch(1),
	borderRadius: z.number().int().min(0).catch(0),
	innerGap: z.number().int().min(0).catch(11),
	placeholder: z.string().catch('type here...')
});

export type Appearance = z.infer<typeof AppearanceSchema>;
