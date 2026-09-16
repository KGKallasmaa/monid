import { z } from "zod";
import {
    TIME_BOUND_FORMAT,
    zKeenableTimeBound,
} from "../../../schema/common.ts";

/**
 * POST /v1/search body — OpenAPI SearchRequest (docs.keenable.ai
 * api-reference/openapi.json, 2026-09-16). Mirror carries optionality
 * only (D25): `max_results` vendor default 10 is not a billing knob
 * (the model is PER_CALL), so it stays optional. `.strict()`: `mode`
 * is decided per call by Keenable and is not a REST request field
 * (credits docs; design D3) — a pasted SDK payload that sends it
 * fails INVALID_INPUT rather than riding through.
 */
export const zKeenableSearchBody = z.object({
    query: z.string().min(1).describe(
        "The search query. Natural language; describe the page you want.",
    ),
    site: z.string().min(1).optional().describe(
        "Restrict results to a specific site, e.g. 'techcrunch.com' or " +
            "'arxiv.org'.",
    ),
    acquired_after: zKeenableTimeBound.optional().describe(
        "Filter to pages Keenable acquired/indexed at or after this " +
            "instant. " + TIME_BOUND_FORMAT,
    ),
    acquired_before: zKeenableTimeBound.optional().describe(
        "Filter to pages Keenable acquired/indexed at or before this " +
            "instant. " + TIME_BOUND_FORMAT,
    ),
    published_after: zKeenableTimeBound.optional().describe(
        "Filter to pages published at or after this instant. " +
            TIME_BOUND_FORMAT,
    ),
    published_before: zKeenableTimeBound.optional().describe(
        "Filter to pages published at or before this instant. " +
            TIME_BOUND_FORMAT,
    ),
    query_time: zKeenableTimeBound.optional().describe(
        "Search the index as it stood at this instant: pages acquired " +
            "after it are excluded. A date resolves to 00:00:00 UTC (not " +
            "the end of the day). Relative deltas on the other date " +
            "filters resolve against this instant instead of now. " +
            TIME_BOUND_FORMAT,
    ),
    snippet_max_length: z.number().int().min(180).max(10000).optional()
        .describe(
            "Maximum length, in characters, of the snippet returned per " +
                "result (180–10000). When omitted, a default snippet " +
                "length is used.",
        ),
    max_results: z.number().int().min(1).max(50).optional().describe(
        "Maximum number of results to return (1–50). When omitted, up " +
            "to 10 results are returned.",
    ),
}).strict();
