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

	it("serves the check-in page without an API key", async () => {
		const response = await SELF.fetch("http://local.test/view");
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type") ?? "").toContain("text/html");
		const html = await response.text();
		expect(html).toContain("localStorage");
		expect(html).toContain("google.com/maps");
		expect(html).toContain("<table>");
	});

	it("serves the check-in page at / when the browser asks for HTML", async () => {
		const response = await SELF.fetch("http://local.test/", {
			headers: { Accept: "text/html" },
		});
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type") ?? "").toContain("text/html");
	});

	it("still serves the OpenAPI document", async () => {
		const response = await SELF.fetch("http://local.test/openapi.json");
		expect(response.status).toBe(200);
		const body = await response.json<{ components?: { securitySchemes?: { ApiKey?: { name?: string } } } }>();
		expect(body.components?.securitySchemes?.ApiKey?.name).toBe("X-API-Key");
	});
});
