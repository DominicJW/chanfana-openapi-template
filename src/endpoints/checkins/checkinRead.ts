import { D1ReadEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { CheckinModel } from "./base";

export class CheckinRead extends D1ReadEndpoint<HandleArgs> {
	_meta = {
		model: CheckinModel,
	};
}
