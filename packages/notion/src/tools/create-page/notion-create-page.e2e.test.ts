import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { NotionCreatePageTool } from "./notion-create-page";

describe("NotionCreatePageTool E2E", () => {
  let createPageTool: NotionCreatePageTool;

  beforeAll(() => {
    // Check for required environment variables
    if (!process.env.NOTION_API_KEY) {
      throw new Error("NOTION_API_KEY environment variable is required");
    }
    if (!process.env.NOTION_TEST_PARENT_PAGE_ID) {
      throw new Error(
        "NOTION_TEST_PARENT_PAGE_ID environment variable is required"
      );
    }
  });

  beforeEach(() => {
    // Initialize the create page tool with real Notion token
    createPageTool = new NotionCreatePageTool({
      auth: { token: process.env.NOTION_API_KEY!, version: "2022-06-28" },
    });
  });

  it("should create a new page in Notion", async () => {
    const result = await createPageTool.execute(
      {
        parent_id: process.env.NOTION_TEST_PARENT_PAGE_ID!,
        title: `Test Page ${new Date().toISOString()}`,
      },
      { toolCallId: "test", messages: [] }
    );

    // Verify the response structure
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.object).toBe("page");

    // Log the result for debugging
    console.log("Created Page:", JSON.stringify(result, null, 2));
  }, 30000);
});
