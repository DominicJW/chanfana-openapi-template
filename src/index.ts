import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { requireApiKey } from "./auth";
import { subRouter } from "./endpoints/checkins/router";
import { ContentfulStatusCode } from "hono/utils/http-status";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.use("*", requireApiKey);

app.onError((err, c) => {
	if (err instanceof ApiException) {
		// If it's a Chanfana ApiException, let Chanfana handle the response
		return c.json(
			{ success: false, errors: err.buildResponse() },
			err.status as ContentfulStatusCode,
		);
	}

	console.error("Global error handler caught:", err); // Log the error if it's not known

	// For other errors, return a generic 500 response
	return c.json(
		{
			success: false,
			errors: [{ code: 7000, message: "Internal Server Error" }],
		},
		500,
	);
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/docs",
	schema: {
		info: {
			title: "Location Checkin API",
			version: "0",
			description: "Simple API to allow me to checkin location via internet",
		},
		security: [{ ApiKey: [] }],
	},
});

openapi.registry.registerComponent("securitySchemes", "ApiKey", {
	type: "apiKey",
	in: "header",
	name: "X-API-Key",
});

// Register  Sub router
openapi.route("/", subRouter);

// Export the Hono app
export default app;
