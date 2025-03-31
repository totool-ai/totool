import { describe, it, expect, beforeAll } from "vitest";
import { NotionRetrievePageTool } from "./index";
import { Auth } from "../../schemas/auth";

describe("NotionRetrievePageTool E2E", () => {
  let retrievePageTool: NotionRetrievePageTool;

  beforeAll(() => {
    const auth: Auth = {
      token: process.env.NOTION_API_KEY!,
      version: "2022-06-28",
    };

    retrievePageTool = new NotionRetrievePageTool({ auth });
  });

  it("should retrieve a page from Notion", async () => {
    const pageId = process.env.NOTION_TEST_PAGE_ID!;
    const response = await retrievePageTool.execute(
      { page_id: pageId },
      { auth: { token: process.env.NOTION_API_KEY!, version: "2022-06-28" } }
    );

    expect(response).toBeDefined();
    console.log("Retrieved Page:", response);
  });

  it("should handle non-existent page", async () => {
    // Use a valid UUID format for a non-existent page
    const nonExistentPageId = "00000000-0000-0000-0000-000000000000";

    await expect(
      retrievePageTool.execute(
        { page_id: nonExistentPageId },
        { auth: { token: process.env.NOTION_API_KEY!, version: "2022-06-28" } }
      )
    ).rejects.toThrow("Could not find page with ID");
  });
});
