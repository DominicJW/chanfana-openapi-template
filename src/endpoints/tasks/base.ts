import { z } from "zod";

export const checkin = z.object({
	id: z.number().int(),
	lat: z.number.float(),
	long: z.number.float(),
	location_timestamp: z.string().datetime(),
	client_timestamp: z.string().datetime(),
	server_timestamp: z.string().datetime(),
});

export const CheckinModel = {
	tableName: "tasks",
	primaryKeys: ["id"],
	schema: checkin,
	serializer: (obj: Record<string, string | number | boolean>) => {
		return {
			...obj,
			completed: Boolean(obj.completed),
		};
	},
	serializerObject: task,
};
