import { z } from "zod";

/**
 * Auth schema for notion actions
 * This is the API key/secret text information needed to authenticate with notion
 */
export const authSchema = z.object({
  token: z
    .string()
    .min(1, "Notion API token is required")
    .describe(
      "The Notion integration token. This is required to authenticate API requests."
    ),
  version: z
    .string()
    .default("2022-06-28")
    .describe(
      "The Notion API version to use. Defaults to '2022-06-28' if not specified."
    ),
});

export type Auth = z.infer<typeof authSchema>;
