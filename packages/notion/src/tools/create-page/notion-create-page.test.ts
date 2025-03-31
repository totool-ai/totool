import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotionCreatePageTool } from "./notion-create-page";
import { Auth } from "../../schemas/auth";
import { Client } from "@notionhq/client";

// Mock the Notion client
vi.mock("@notionhq/client", () => {
  return {
    Client: vi.fn().mockImplementation(() => ({
      pages: {
        create: vi.fn(),
      },
      databases: {
        retrieve: vi.fn(),
      },
    })),
  };
});

describe("NotionCreatePageTool", () => {
  let tool: NotionCreatePageTool;
  let mockPages: { create: ReturnType<typeof vi.fn> };
  let mockDatabases: { retrieve: ReturnType<typeof vi.fn> };
  const mockConfig = { auth: { token: "test-token", version: "2022-06-28" } };

  beforeEach(() => {
    const auth: Auth = {
      token: "test-token",
      version: "2022-06-28",
    };

    tool = new NotionCreatePageTool({ auth });
    mockPages = (tool as any).notion.pages;
    mockDatabases = (tool as any).notion.databases;
  });

  it("should initialize with correct configuration", () => {
    expect(tool).toBeDefined();
    expect((tool as any).notion).toBeDefined();
  });

  it("should successfully create a page when parent is a page", async () => {
    const mockPageData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      object: "page",
    };

    mockPages.create.mockResolvedValueOnce(mockPageData);

    const result = await tool.execute(
      {
        parent_id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Test Page",
        properties: {
          description: {
            type: "text",
            text: {
              content: "Test Description",
            },
          },
        },
      },
      mockConfig
    );

    expect(result).toEqual(mockPageData);
  });

  it("should successfully create a page when parent is a database", async () => {
    const mockPageData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      object: "page",
    };

    mockDatabases.retrieve.mockResolvedValueOnce({
      id: "123e4567-e89b-12d3-a456-426614174000",
      object: "database",
    });
    mockPages.create.mockResolvedValueOnce(mockPageData);

    const result = await tool.execute(
      {
        parent_id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Test Page",
        properties: {
          description: {
            type: "text",
            text: {
              content: "Test Description",
            },
          },
        },
      },
      mockConfig
    );

    expect(result).toEqual(mockPageData);
  });

  it("should handle parent not found error", async () => {
    mockDatabases.retrieve.mockRejectedValueOnce(new Error("Not found"));

    await expect(
      tool.execute(
        {
          parent_id: "invalid-id",
          title: "Test Page",
          properties: {
            description: {
              type: "text",
              text: {
                content: "Test Description",
              },
            },
          },
        },
        mockConfig
      )
    ).rejects.toThrow("Failed to create Notion page");
  });

  it("should handle page creation error", async () => {
    mockPages.create.mockRejectedValueOnce(new Error("Failed to create page"));

    await expect(
      tool.execute(
        {
          parent_id: "123e4567-e89b-12d3-a456-426614174000",
          title: "Test Page",
          properties: {
            description: {
              type: "text",
              text: {
                content: "Test Description",
              },
            },
          },
        },
        mockConfig
      )
    ).rejects.toThrow("Failed to create Notion page");
  });
});
