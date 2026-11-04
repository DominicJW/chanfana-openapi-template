import { Hono } from "hono";
import { fromHono } from "chanfana";
import { TaskList } from "./taskList";
import { TaskCreate } from "./taskCreate";
import { TaskRead } from "./taskRead";

export const tasksRouter = fromHono(new Hono());

tasksRouter.get("/", TaskList);
tasksRouter.post("/", TaskCreate);
tasksRouter.get("/:id", TaskRead);
