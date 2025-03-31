import { describe, it, expect, vi, beforeEach } from "vitest";
import { Client } from "@notionhq/client";
import { NotionSearchTool } from "./notion-search";

// Mock the Notion client
vi.mock("@notionhq/client", () => {
  const mockSearch = vi.fn<[any], Promise<any>>();
  return {
    Client: vi.fn().mockImplementation(() => ({
      search: mockSearch,
    })),
  };
});

describe("NotionSearchTool", () => {
  let tool: NotionSearchTool;
  let mockSearch: ReturnType<typeof vi.fn<[any], Promise<any>>>;

  beforeEach(() => {
    tool = new NotionSearchTool({
      auth: { token: "test-token", version: "2022-06-28" },
    });
    // Set the auth token for testing
    (tool as any).auth = { token: "test-token" };
    mockSearch = vi.mocked(new Client({ auth: "test-token" }).search);
  });

  describe("execute", () => {
    it("should successfully search for pages and databases", async () => {
      const mockResponse = {
        type: "page_or_database" as const,
        page_or_database: {},
        object: "list" as const,
        results: [
          {
            id: "page-1",
            type: "page" as const,
            object: "page" as const,
            properties: {
              title: { title: [{ plain_text: "Test Page" }] },
            },
          },
        ],
        next_cursor: "next-page",
        has_more: true,
      };

      mockSearch.mockResolvedValueOnce(mockResponse);

      const result = await tool.execute(
        { query: "test" },
        { toolCallId: "test", messages: [] }
      );

      expect(result).toEqual(mockResponse);
      expect(mockSearch).toHaveBeenCalledWith({
        query: "test",
        page_size: undefined,
        start_cursor: undefined,
      });
    });

    it("should handle pagination parameters", async () => {
      const mockResponse = {
        type: "page_or_database" as const,
        page_or_database: {},
        object: "list" as const,
        results: [],
        next_cursor: null,
        has_more: false,
      };

      mockSearch.mockResolvedValueOnce(mockResponse);

      await tool.execute(
        {
          query: "test",
          pageSize: 50,
          startCursor: "start-from-here",
        },
        { toolCallId: "test", messages: [] }
      );

      expect(mockSearch).toHaveBeenCalledWith({
        query: "test",
        page_size: 50,
        start_cursor: "start-from-here",
      });
    });

    it("should handle API errors gracefully", async () => {
      const errorMessage = "API Error";
      mockSearch.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        tool.execute({ query: "test" }, { toolCallId: "test", messages: [] })
      ).rejects.toThrow(`Notion search failed: ${errorMessage}`);
    });

    it("should handle non-Error exceptions", async () => {
      mockSearch.mockRejectedValueOnce("string error");

      await expect(
        tool.execute({ query: "test" }, { toolCallId: "test", messages: [] })
      ).rejects.toThrow("string error");
    });
  });
});
