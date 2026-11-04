import { z } from "zod";

export const checkin = z.object({
	id: z.number().int(),
	lat: z.number().nullable(),
	lon: z.number().nullable(),
	accuracy: z.number().nullable(),
	provider: z.string().nullable(),
	stale: z.boolean(),
	fix_timestamp: z.string().datetime().nullable(),
	client_timestamp: z.string().datetime(),
	battery: z.number(),
	seq: z.number().int(),
	interval_min: z.number(),
	error: z.string().optional(),
  });
  

export const CheckinModel = {
	tableName: "checkins",
	primaryKeys: ["id"],
	schema: checkin,
	serializer: (obj: Record<string, string | number | boolean>) => {
		return {
			...obj
		};
	},
	serializerObject: checkin,
};
