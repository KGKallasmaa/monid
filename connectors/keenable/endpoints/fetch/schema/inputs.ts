import { z } from "zod";

/**
 * GET /v1/fetch query params — OpenAPI fetch parameters
 * (docs.keenable.ai api-reference/openapi.json, 2026-09-16). Mirror
 * carries optionality only (D25): `max_chars` vendor default 50000
 * and `live` vendor default false are behaviour knobs the estimate
 * does not read (the model is PER_CALL), so they stay optional.
 * `.strict()`: unknown keys fail INVALID_INPUT.
 */
export const zKeenableFetchQueryParams = z.object({
    url: z.url({ protocol: /^https?$/ }).describe(
        "URL to fetch. By default only URLs in Keenable's index are " +
            "supported; a miss is an error. Pass live=true to fetch " +
            "directly from the source, including unindexed URLs.",
    ),
    max_chars: z.number().int().min(1).optional().describe(
        "Maximum number of characters of content to return. Longer " +
            "content is truncated and a notice is appended after the " +
            "cut, so the response runs slightly past this number. " +
            "Vendor default 50000.",
    ),
    live: z.boolean().optional().describe(
        "Fetch the page live from the source instead of returning " +
            "Keenable's indexed copy. Enables fetching URLs that are " +
            "not indexed. Vendor default false. Live fetch is a " +
            "separate SKU (fetch.live); this doc still bills 1 credit " +
            "per call (design D4).",
    ),
    prompt: z.string().min(1).max(2000).optional().describe(
        "Optional extraction instruction, at most 2000 characters. " +
            "When set, an LLM reads the fetched page and `content` " +
            "contains only the output for this instruction instead of " +
            "the full page. Example: 'List all pricing tiers with " +
            "their monthly prices'.",
    ),
}).strict();
