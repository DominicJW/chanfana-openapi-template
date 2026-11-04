import { D1ListEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { CheckinModel } from "./base";

export class CheckinList extends D1ListEndpoint<HandleArgs> {
	_meta = {
		model: CheckinModel,
	};

	searchFields = ["lat","long","fix_timestamp","client_timestamp","server_timestamp"];

	defaultOrderBy = "client_timestamp DESC";
}
