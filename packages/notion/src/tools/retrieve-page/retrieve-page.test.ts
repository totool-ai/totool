import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotionRetrievePageTool } from "./index";
import { Auth } from "../../schemas/auth";
import { Client } from "@notionhq/client";

// Mock the Notion client
vi.mock("@notionhq/client", () => {
  return {
    Client: vi.fn().mockImplementation(() => ({
      pages: {
        retrieve: vi.fn(),
      },
    })),
  };
});

describe("NotionRetrievePageTool", () => {
  let tool: NotionRetrievePageTool;
  let mockPages: { retrieve: ReturnType<typeof vi.fn> };
  const mockConfig = { toolCallId: "test", messages: [] };

  beforeEach(() => {
    const auth: Auth = {
      token: "test-token",
      version: "2022-06-28",
    };

    tool = new NotionRetrievePageTool({ auth });
    mockPages = (tool as any).notion.pages;
  });

  it("should initialize with correct configuration", () => {
    expect(tool).toBeDefined();
    expect((tool as any).notion).toBeDefined();
  });

  it("should validate input schema", async () => {
    // Mock successful response for valid input
    mockPages.retrieve.mockResolvedValueOnce({
      id: "123e4567-e89b-12d3-a456-426614174000",
      object: "page",
    });

    // Valid input
    const result = await tool.execute(
      { page_id: "123e4567-e89b-12d3-a456-426614174000" },
      mockConfig
    );
    expect(result).toBeDefined();

    // Invalid input - empty page_id
    await expect(tool.execute({ page_id: "" }, mockConfig)).rejects.toThrow(
      "Page ID is required"
    );
  });

  it("should handle API errors", async () => {
    // Mock 404 error
    mockPages.retrieve.mockRejectedValueOnce(new Error("404 Not Found"));
    await expect(
      tool.execute(
        { page_id: "123e4567-e89b-12d3-a456-426614174000" },
        mockConfig
      )
    ).rejects.toThrow("Page not found with ID");

    // Mock 403 error
    mockPages.retrieve.mockRejectedValueOnce(new Error("403 Forbidden"));
    await expect(
      tool.execute(
        { page_id: "123e4567-e89b-12d3-a456-426614174000" },
        mockConfig
      )
    ).rejects.toThrow("Access denied to page with ID");

    // Mock other error
    mockPages.retrieve.mockRejectedValueOnce(
      new Error("Internal Server Error")
    );
    await expect(
      tool.execute(
        { page_id: "123e4567-e89b-12d3-a456-426614174000" },
        mockConfig
      )
    ).rejects.toThrow("Failed to retrieve page");
  });

  it("should return page data on success", async () => {
    const mockPageData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      object: "page",
      created_time: "2023-01-01T00:00:00.000Z",
      last_edited_time: "2023-01-01T00:00:00.000Z",
      properties: {
        title: {
          title: [
            {
              text: {
                content: "Test Page",
              },
            },
          ],
        },
      },
    };

    mockPages.retrieve.mockResolvedValueOnce(mockPageData);

    const result = await tool.execute(
      { page_id: "123e4567-e89b-12d3-a456-426614174000" },
      mockConfig
    );

    expect(result).toEqual(mockPageData);
    expect(mockPages.retrieve).toHaveBeenCalledWith({
      page_id: "123e4567-e89b-12d3-a456-426614174000",
    });
  });
});
