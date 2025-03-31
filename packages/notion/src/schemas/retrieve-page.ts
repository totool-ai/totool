import { z } from "zod";

/**
 * Input schema for Retrieve Notion Page
 */
export const inputSchema = z.object({
  page_id: z
    .string()
    .min(1, "Page ID is required")
    .describe(
      "The ID of the page to retrieve. This is a UUID that identifies a specific Notion page. Example: '123e4567-e89b-12d3-a456-426614174000'"
    ),
});

export type RetrievePageInput = z.infer<typeof inputSchema>;

/**
 * Metadata for the notion_retrieve_page tool
 */
export const name = "notion_retrieve_page";
export const description =
  "Retrieves a Page object using the ID specified. Returns page properties, not page content. Note: Properties with more than 25 references might not be fully returned.";
export const service = "notion";
