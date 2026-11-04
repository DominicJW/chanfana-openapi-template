import type { MiddlewareHandler } from "hono";

export const API_KEY_HEADER = "X-API-Key";

/** Documentation routes stay reachable so the schema can be viewed. Data routes do not. */
const PUBLIC_GET_PATHS = new Set(["/docs", "/redocs", "/openapi.json", "/openapi.yaml"]);

export const requireApiKey: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
	if (
		(c.req.method === "GET" || c.req.method === "HEAD") &&
		PUBLIC_GET_PATHS.has(c.req.path)
	) {
		return next();
	}

	const expected = c.env.API_KEY;
	const provided = c.req.header(API_KEY_HEADER) ?? "";
	if (!expected || !apiKeysMatch(provided, expected)) {
		return c.json(
			{ success: false, errors: [{ code: 4010, message: "Unauthorized" }] },
			401,
		);
	}

	return next();
};

function apiKeysMatch(provided: string, expected: string): boolean {
	const encoder = new TextEncoder();
	const providedBytes = encoder.encode(provided);
	const expectedBytes = encoder.encode(expected);
	if (providedBytes.byteLength !== expectedBytes.byteLength || providedBytes.byteLength === 0) {
		return false;
	}
	return crypto.subtle.timingSafeEqual(providedBytes, expectedBytes);
}
