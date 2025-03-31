import { z } from "zod";
import { authSchema } from "./auth";

/**
 * Common text content schema
 */
const textContent = z.object({
  content: z.string(),
});

/**
 * Block types for the MVP
 */
const blockContent = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("paragraph"),
    paragraph: z.object({
      text: textContent,
    }),
  }),
  z.object({
    type: z.literal("heading_1"),
    heading_1: z.object({
      text: textContent,
    }),
  }),
  z.object({
    type: z.literal("heading_2"),
    heading_2: z.object({
      text: textContent,
    }),
  }),
  z.object({
    type: z.literal("heading_3"),
    heading_3: z.object({
      text: textContent,
    }),
  }),
  z.object({
    type: z.literal("bulleted_list_item"),
    bulleted_list_item: z.object({
      text: textContent,
    }),
  }),
]);

/**
 * Input schema for Add Notion Page Content
 */
export const inputSchema = z.object({
  block_id: z.string().describe("The ID of the block to add content to"),
  children: z
    .array(blockContent)
    .max(100)
    .describe("Array of content blocks to add (max 100)"),
});

/**
 * Metadata for the notion_add_page_content tool
 */
export const name = "notion_add_page_content";
export const description =
  "Adds new content blocks to a Notion page, supporting various content types like paragraphs, headings, and lists.";
export const service = "notion";
