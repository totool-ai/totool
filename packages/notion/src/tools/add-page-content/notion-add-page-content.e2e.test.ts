import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { NotionAddPageContentTool } from "./notion-add-page-content";
import dotenv from "dotenv";

describe("NotionAddPageContentTool E2E", () => {
  let addPageContentTool: NotionAddPageContentTool;

  beforeAll(() => {
    // Check for required environment variables
    if (!process.env.NOTION_API_KEY) {
      throw new Error("NOTION_API_KEY environment variable is required");
    }
    if (!process.env.NOTION_TEST_PAGE_ID) {
      throw new Error("NOTION_TEST_PAGE_ID environment variable is required");
    }
  });

  beforeEach(() => {
    // Initialize the add page content tool with real Notion token
    addPageContentTool = new NotionAddPageContentTool({
      auth: { token: process.env.NOTION_API_KEY!, version: "2022-06-28" },
    });
  });

  it("should add content blocks to a Notion page", async () => {
    const result = await addPageContentTool.execute(
      {
        block_id: process.env.NOTION_TEST_PAGE_ID!,
        children: [
          {
            type: "heading_1",
            heading_1: {
              text: {
                content: "Test Content Section",
              },
            },
          },
          {
            type: "paragraph",
            paragraph: {
              text: {
                content: "This is a test paragraph created by the E2E test.",
              },
            },
          },
          {
            type: "heading_2",
            heading_2: {
              text: {
                content: "Subsection",
              },
            },
          },
          {
            type: "bulleted_list_item",
            bulleted_list_item: {
              text: {
                content: "Test bullet point 1",
              },
            },
          },
          {
            type: "bulleted_list_item",
            bulleted_list_item: {
              text: {
                content: "Test bullet point 2",
              },
            },
          },
        ],
      },
      { toolCallId: "test", messages: [] }
    );

    // Verify the response structure
    expect(result).toBeDefined();
    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results.length).toBe(5);

    // Log the result for debugging
    console.log("Added Content:", JSON.stringify(result, null, 2));
  }, 30000);
});
