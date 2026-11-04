import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const KEY = "test-api-key";

describe("API key authentication", () => {
	it("rejects a check-in with no key", async () => {
		const response = await SELF.fetch("http://local.test/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ lat: 1, lon: 2 }),
		});

		expect(response.status).toBe(401);
	});

	it("rejects a check-in with the wrong key", async () => {
		const response = await SELF.fetch("http://local.test/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": "not-the-key",
			},
			body: JSON.stringify({ lat: 1, lon: 2 }),
		});

		expect(response.status).toBe(401);
	});

	it("rejects a list request with no key", async () => {
		const response = await SELF.fetch("http://local.test/");
		expect(response.status).toBe(401);
	});

	it("lets a request with the shared key past authentication", async () => {
		const response = await SELF.fetch("http://local.test/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": KEY,
			},
			body: JSON.stringify({ lat: 1, lon: 2 }),
		});

		expect(response.status).not.toBe(401);
	});

	it("still serves the OpenAPI document", async () => {
		const response = await SELF.fetch("http://local.test/openapi.json");
		expect(response.status).toBe(200);
		const body = await response.json<{ components?: { securitySchemes?: { ApiKey?: { name?: string } } } }>();
		expect(body.components?.securitySchemes?.ApiKey?.name).toBe("X-API-Key");
	});
});
