import { D1CreateEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { CheckinModel } from "./base";

export class CheckinCreate extends D1CreateEndpoint<HandleArgs> {
	_meta = {
	  model: CheckinModel,
	  fields: CheckinModel.schema.pick({
		lat: true,
		lon: true,
		accuracy: true,
		provider: true,
		stale: true,
		fix_timestamp: true,
		client_timestamp: true,
		battery: true,
		seq: true,
		interval_min: true,
		error: true,
	  }).partial(),
	};
  }
  