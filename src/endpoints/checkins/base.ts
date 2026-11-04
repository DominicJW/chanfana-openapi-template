import { z } from "zod";

export const checkin = z.object({
	id: z.number().int(),
	lat: z.number().nullable(),
	lon: z.number().nullable(),
	accuracy: z.number().nullable(),
	provider: z.string().nullable(),
	stale: z.boolean().nullable(),
	fix_timestamp: z.string().datetime().nullable(),
	client_timestamp: z.string().datetime().nullable(),
	server_timestamp: z.string().datetime().nullable(),
	battery: z.number().nullable(),
	seq: z.number().int().nullable(),
	interval_min: z.number().nullable(),
	error: z.string().nullable(),
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
