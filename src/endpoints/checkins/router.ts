import { Hono } from "hono";
import { fromHono } from "chanfana";
import { CheckinList } from "./checkinList";
import { CheckinCreate } from "./checkinCreate";
import { CheckinRead  } from "./checkinRead";

export const subRouter = fromHono(new Hono());

subRouter.get("/", CheckinList);
subRouter.post("/", CheckinCreate);
subRouter.get("/:id", CheckinRead);
