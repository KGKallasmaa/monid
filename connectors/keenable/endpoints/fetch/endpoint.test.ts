import { assert, assertEquals, assertRejects } from "@std/assert";
import type { Json } from "@shared/core";
import { fromFileUrl } from "@std/path";
import {
    liveSkip,
    loadFixture,
    runEndpoint,
    testSealedUnit,
} from "@shared/testing";

const fixturesDir = fromFileUrl(new URL("../../fixtures/", import.meta.url));

Deno.test("keenable#fetch happy (synthetic): one credit; fold settles; markdown content", async () => {
    const unit = await testSealedUnit("keenable#fetch");
    const fixture = await loadFixture(`${fixturesDir}synthetic-fetch-ok.json`);
    const result = await runEndpoint({
        unit,
        input: { queryParams: { url: "https://example.com" } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 200);
    assertEquals(result.isProviderError, false);
    assertEquals(result.usage, {
        credits: { default: 1 },
        evidence: { CALL: 1 },
    });
    const output = result.output as Record<string, unknown>;
    assertEquals(output.url, "https://example.com/");
    assertEquals(output.title, "Example Domain");
    assert(
        typeof output.content === "string" &&
            (output.content as string).includes("Example Domain"),
        "markdown content present",
    );
});

Deno.test("keenable#fetch provider error (recorded 401): data, zero usage", async () => {
    const unit = await testSealedUnit("keenable#fetch");
    const fixture = await loadFixture(`${fixturesDir}unauthorized-fetch.json`);
    const result = await runEndpoint({
        unit,
        input: { queryParams: { url: "https://example.com" } },
        mode: "replay",
        fixture,
    });
    assertEquals(result.httpStatus, 401);
    assertEquals(result.isProviderError, true);
    assertEquals(result.usage, { credits: {}, evidence: {} });
    assertEquals(result.output, {
        error: "Authentication failed",
        message: "Malformed API key",
    });
});

Deno.test("keenable#fetch: url required; prompt bounded; unknown keys rejected", async () => {
    const unit = await testSealedUnit("keenable#fetch");
    const fixture = await loadFixture(`${fixturesDir}synthetic-fetch-ok.json`);
    const rejected: Record<string, Json>[] = [
        {},
        { url: "not-a-url" },
        { url: "https://example.com", max_chars: 0 },
        { url: "https://example.com", prompt: "x".repeat(2001) },
        { url: "https://example.com", bogus: 1 },
    ];
    for (const queryParams of rejected) {
        await assertRejects(
            () =>
                runEndpoint({
                    unit,
                    input: { queryParams },
                    mode: "replay",
                    fixture,
                }),
            Error,
            "INVALID_INPUT",
            JSON.stringify(queryParams),
        );
    }
});

Deno.test({
    name: "keenable#fetch live (gated on KEENABLE_API_KEY)",
    ignore: liveSkip("keenable"),
    fn: async () => {
        const unit = await testSealedUnit("keenable#fetch");
        const result = await runEndpoint({
            unit,
            input: { queryParams: { url: "https://example.com" } },
            mode: "live",
        });
        assertEquals(
            result.isProviderError,
            false,
            JSON.stringify(result.output),
        );
        assertEquals(result.usage, {
            credits: { default: 1 },
            evidence: { CALL: 1 },
        });
        const output = result.output as Record<string, unknown>;
        assertEquals(typeof output.content, "string");
    },
});
