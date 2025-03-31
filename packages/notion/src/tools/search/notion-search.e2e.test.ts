import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { NotionSearchTool } from "./notion-search";
import dotenv from "dotenv";

describe("NotionSearchTool E2E", () => {
  let searchTool: NotionSearchTool;

  beforeAll(() => {
    // Check for required environment variables
    if (!process.env.NOTION_API_KEY) {
      throw new Error("NOTION_API_KEY environment variable is required");
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
  });

  beforeEach(() => {
    // Initialize the search tool with real Notion token
    searchTool = new NotionSearchTool({
      auth: { token: process.env.NOTION_API_KEY!, version: "2022-06-28" },
    });
  });

  it("should directly search Notion using the tool", async () => {
    // Test direct search functionality
    const result = await searchTool.execute(
      { query: "test" },
      { toolCallId: "test", messages: [] }
    );

    // Verify the response structure
    expect(result).toBeDefined();
    expect(result.object).toBe("list");
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.has_more).toBeDefined();

    // Log the results for debugging
    console.log("Search Results:", JSON.stringify(result, null, 2));
  }, 30000);
});
