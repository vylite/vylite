import { z } from 'zod';

const LengthSchema = z.union([z.number().min(0), z.string().regex(/^\d+(\.\d+)?%$/)]);

const PaddingSchema = z.union([LengthSchema, z.object({ start: LengthSchema, end: LengthSchema })]);

const SizeSchema = z.union([LengthSchema, z.object({ padding: PaddingSchema })]);

const AnchorSchema = z.enum([
	'top-left',
	'top',
	'top-right',
	'left',
	'center',
	'right',
	'bottom-left',
	'bottom',
	'bottom-right'
]);

const ScreenLayoutSchema = z.object({
	width: SizeSchema,
	height: SizeSchema,
	anchor: AnchorSchema
});

const HOME_LAYOUT: ScreenLayout = { width: 930, height: 581, anchor: 'center' };

const PAGE_LAYOUT: ScreenLayout = {
	width: 930,
	height: { padding: { start: '16.5%', end: '5%' } },
	anchor: 'center'
};

export const AppearanceSchema = z.object({
	theme: z.string().catch('rosepine'),
	borderWidth: z.number().int().min(0).catch(1),
	borderRadius: z.number().int().min(0).catch(0),
	innerGap: z.number().int().min(0).catch(6),
	edgeGap: z.number().int().min(0).catch(6),
	rowPadding: z.number().int().min(0).catch(6),
	placeholder: z.string().catch('type here...'),
	layout: z
		.object({
			home: ScreenLayoutSchema.catch(HOME_LAYOUT),
			page: ScreenLayoutSchema.catch(PAGE_LAYOUT)
		})
		.catch({ home: HOME_LAYOUT, page: PAGE_LAYOUT })
});

export type Appearance = z.infer<typeof AppearanceSchema>;
export type ScreenLayout = z.infer<typeof ScreenLayoutSchema>;
export type Length = z.infer<typeof LengthSchema>;
export type Padding = z.infer<typeof PaddingSchema>;
export type Size = z.infer<typeof SizeSchema>;
export type Anchor = z.infer<typeof AnchorSchema>;
