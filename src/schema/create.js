const { z } = require('zod');

const createSchema = z.object({
	transparent: z.boolean().optional().default(true),
	backgroundColor: z
		.number()
		.int()
		.gte(0)
		.lte(0xffffff)
		.optional()
		.default(0x0000000),
	objectColor: z
		.number()
		.int()
		.gte(0)
		.lte(0xffffff)
		.optional()
		.default(0xffffff),
	name: z.string().optional(),
	width: z.number().int().gte(128).lte(2048),
	height: z.number().int().gte(128).lte(2048),
	loop: z.number().int().gte(-1).optional().default(-1),
	delay: z.number().int().gte(1),
	anglePerFrame: z.number().positive().lte(360),
	cameraRotationAxis: z.enum(['X', 'Y', 'Z']),
	initialRotation: z
		.object({
			x: z.number().gte(0).lte(360).optional(),
			y: z.number().gte(0).lte(360).optional(),
			Z: z.number().gte(0).lte(360).optional(),
		})
		.optional()
		.default({}),
	threshold: z.number().gte(0).lte(100).optional().default(0),
	axisSpace: z.enum(['WORLD', 'OBJECT']).optional().default('WORLD'),
});

module.exports = {
	createSchema,
};
