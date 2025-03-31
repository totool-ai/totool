import { describe, it, expect, vi, beforeEach } from "vitest";
import { Client } from "@notionhq/client";
import { NotionAddPageContentTool } from "./notion-add-page-content";

// Mock the Notion client
vi.mock("@notionhq/client", () => {
  const mockBlocks = {
    retrieve: vi.fn(),
    children: {
      append: vi.fn(),
    },
  };
  return {
    Client: vi.fn().mockImplementation(() => ({
      blocks: mockBlocks,
    })),
  };
});

describe("NotionAddPageContentTool", () => {
  let tool: NotionAddPageContentTool;
  let mockBlocks: {
    retrieve: ReturnType<typeof vi.fn>;
    children: { append: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    tool = new NotionAddPageContentTool({
      auth: { token: "test-token", version: "2022-06-28" },
    });
    // Set the auth token for testing
    (tool as any).auth = { token: "test-token" };
    const client = new Client({ auth: "test-token" });
    mockBlocks = client.blocks as any;
  });

  describe("execute", () => {
    it("should successfully add content blocks to a page", async () => {
      const mockResponse = {
        results: [
          {
            id: "block-1",
            type: "paragraph",
          },
          {
            id: "block-2",
            type: "heading_1",
          },
        ],
      };

      mockBlocks.retrieve.mockResolvedValueOnce({ id: "test-block" });
      mockBlocks.children.append.mockResolvedValueOnce(mockResponse);

      const result = await tool.execute(
        {
          block_id: "test-block",
          children: [
            {
              type: "paragraph",
              paragraph: {
                text: {
                  content: "Test paragraph",
                },
              },
            },
            {
              type: "heading_1",
              heading_1: {
                text: {
                  content: "Test heading",
                },
              },
            },
          ],
        },
        { toolCallId: "test", messages: [] }
      );

      expect(result).toEqual({ results: mockResponse.results });
      expect(mockBlocks.children.append).toHaveBeenCalledWith({
        block_id: "test-block",
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "Test paragraph",
                  },
                },
              ],
            },
          },
          {
            object: "block",
            type: "heading_1",
            heading_1: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "Test heading",
                  },
                },
              ],
            },
          },
        ],
      });
    });

    it("should handle block not found error", async () => {
      mockBlocks.retrieve.mockRejectedValueOnce(new Error("Not found"));

      await expect(
        tool.execute(
          {
            block_id: "invalid-block",
            children: [
              {
                type: "paragraph",
                paragraph: {
                  text: {
                    content: "Test paragraph",
                  },
                },
              },
            ],
          },
          { toolCallId: "test", messages: [] }
        )
      ).rejects.toThrow(
        "Block with ID invalid-block not found or not accessible"
      );
    });

    it("should handle content addition error", async () => {
      mockBlocks.retrieve.mockResolvedValueOnce({ id: "test-block" });
      mockBlocks.children.append.mockRejectedValueOnce(new Error("API Error"));

      await expect(
        tool.execute(
          {
            block_id: "test-block",
            children: [
              {
                type: "paragraph",
                paragraph: {
                  text: {
                    content: "Test paragraph",
                  },
                },
              },
            ],
          },
          { toolCallId: "test", messages: [] }
        )
      ).rejects.toThrow("Failed to add content to Notion page: API Error");
    });

    it("should handle all supported block types", async () => {
      mockBlocks.retrieve.mockResolvedValueOnce({ id: "test-block" });
      mockBlocks.children.append.mockResolvedValueOnce({ results: [] });

      await tool.execute(
        {
          block_id: "test-block",
          children: [
            {
              type: "paragraph",
              paragraph: { text: { content: "Test paragraph" } },
            },
            {
              type: "heading_1",
              heading_1: { text: { content: "Test heading 1" } },
            },
            {
              type: "heading_2",
              heading_2: { text: { content: "Test heading 2" } },
            },
            {
              type: "heading_3",
              heading_3: { text: { content: "Test heading 3" } },
            },
            {
              type: "bulleted_list_item",
              bulleted_list_item: { text: { content: "Test bullet" } },
            },
          ],
        },
        { toolCallId: "test", messages: [] }
      );

      expect(mockBlocks.children.append).toHaveBeenCalledTimes(1);
      expect(mockBlocks.children.append.mock.calls[0][0].children).toHaveLength(
        5
      );
    });
  });
});
