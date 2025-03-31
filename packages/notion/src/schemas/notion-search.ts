import { z } from "zod";

/**
 * Auth schema for Notion actions
 * This is the integration token needed to authenticate with Notion
 */
export const authSchema = z.object({
  token: z.string().describe("The Notion integration token"),
});

/**
 * Input schema for Notion Search
 */
export const inputSchema = z.object({
  query: z.string().describe("The search query to find pages and databases"),
  pageSize: z
    .number()
    .optional()
    .describe("The number of items to return per page (default: 100)"),
  startCursor: z
    .string()
    .optional()
    .describe("The cursor to start the search from (for pagination)"),
});

/**
 * Metadata for the notion_search tool
 */
export const name = "notion_search";
export const description =
  "Searches all parent or child pages and databases that have been shared with an integration.";
export const service = "notion";
