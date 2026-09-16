import { defineEndpoint } from "@shared/core";
import { zKeenableFetchQueryParams } from "./schema/inputs.ts";

/**
 * GET /v1/fetch — clean markdown for a known URL.
 *
 * Usage falls back to the provider's PER_CALL 1 credit; estimate and
 * evidence are compiler-synthesized (flat model).
 */
export default defineEndpoint({
    meta: {
        displayName: "Keenable Fetch",
        summary: "Fetch a URL as clean, LLM-ready markdown.",
        description: "Retrieve a page as clean markdown, with title, " +
            "description, and author when available. By default this " +
            "returns Keenable's indexed copy — a URL that is not in " +
            "the index is an error. Pass 'live' to fetch directly from " +
            "the source, including unindexed URLs. Cap returned " +
            "content with 'max_chars', or pass 'prompt' (at most 2000 " +
            "characters) so an LLM reads the page and `content` is " +
            "only the instruction's output instead of the full text. " +
            "Use this when you already know the URL; start from " +
            "/search if you don't.",
        docsUrl: "https://docs.keenable.ai/api-reference/fetch",
        categories: ["web-scraping"],
        notes: [
            "Indexed fetch (`fetch`) and live fetch (`fetch.live`) are " +
            "separate SKUs. Keenable publishes that a fetch costs one " +
            "credit and that live 'draws more than one' without a " +
            "number, and REST responses carry no usage receipt, so " +
            "this doc bills 1 credit per successful call either way " +
            "(design D4).",
        ],
    },
    /** PUBLIC identity (design D22): request.path is `/v1/fetch`; pin
     *  `/fetch` so the catalog id is `keenable#fetch`. */
    endpoint: "/fetch",
    request: { method: "GET", path: "/v1/fetch" },
    input: { schema: { queryParams: zKeenableFetchQueryParams } },
});
