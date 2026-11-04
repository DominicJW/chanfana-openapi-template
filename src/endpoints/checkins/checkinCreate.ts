import { D1CreateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { CheckinModel } from "./base";

export class CheckinCreate extends D1CreateEndpoint<HandleArgs> {
	_meta = {
		model: CheckinModel,
		fields: CheckinModel.schema.pick({
			lat: true,
			long: true,
			source: true,
			fix_timestamp: true,
			client_timestamp: true
			//server timestamp missing on purpose as well as id
		}),
	};
}
