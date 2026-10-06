import { z } from 'zod';

export const SpaceEntrySchema = z.object({
	path: z.string(),
	createdAt: z.number().catch(() => Date.now()),
	lastOpenedAt: z.number().catch(() => Date.now())
});

export const SpaceListSchema = z.object({
	spaces: z
		.array(z.unknown())
		.catch([])
		.transform((entries) => entries.flatMap(getValidEntries))
});

export type SpaceEntry = z.infer<typeof SpaceEntrySchema>;
export type SpaceList = z.infer<typeof SpaceListSchema>;

function getValidEntries(entry: unknown): SpaceEntry[] {
	const result = SpaceEntrySchema.safeParse(entry);
	return result.success ? [result.data] : [];
}
