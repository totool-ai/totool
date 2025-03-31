import { z } from "zod";
import { authSchema } from "./auth";

/**
 * Input schema for Create Notion Page
 */
export const inputSchema = z.object({
  parent_id: z
    .string()
    .describe(
      "The ID of the parent page or database where the new page will be created"
    ),
  title: z.string().describe("The title of the new page"),
  properties: z
    .record(
      z.object({
        type: z.enum(["text", "rich_text"]),
        text: z
          .object({
            content: z.string(),
          })
          .optional(),
        rich_text: z
          .array(
            z.object({
              text: z.object({
                content: z.string(),
              }),
            })
          )
          .optional(),
      })
    )
    .optional()
    .describe("Optional properties for the page"),
});

/**
 * Metadata for the notion_create_page tool
 */
export const name = "notion_create_page";
export const description =
  "Creates a new page in Notion as a child of an existing page or database.";
export const service = "notion";
