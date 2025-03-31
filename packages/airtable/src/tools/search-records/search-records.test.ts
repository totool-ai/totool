import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchRecordsTool } from "./search-records";
import Airtable from "airtable";

// Mock Airtable
vi.mock("airtable", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      base: vi.fn().mockReturnThis(),
      table: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      all: vi.fn().mockResolvedValue([
        {
          id: "rec123",
          _rawJson: { createdTime: "2024-01-01T00:00:00.000Z" },
          fields: { Name: "John", Age: 30 },
        },
        {
          id: "rec456",
          _rawJson: { createdTime: "2024-01-02T00:00:00.000Z" },
          fields: { Name: "Jane", Age: 25 },
        },
      ]),
    })),
  };
});

describe("SearchRecordsTool", () => {
  let tool: SearchRecordsTool;

  beforeEach(() => {
    tool = new SearchRecordsTool({
      auth: { accessToken: "test-token" },
    });
  });

  it("should search records with equals condition", async () => {
    const result = await tool.execute(
      {
        baseId: "base123",
        tableId: "table123",
        searchField: "Name",
        searchType: "equals",
        searchValue: "John",
      },
      {}
    );

    expect(result).toBeDefined();
    expect(result.records).toHaveLength(2);
    expect(result.records[0].id).toBe("rec123");
    expect(result.records[0].fields.Name).toBe("John");
  });

  it("should search records with contains condition", async () => {
    const result = await tool.execute(
      {
        baseId: "base123",
        tableId: "table123",
        searchField: "Name",
        searchType: "contains",
        searchValue: "J",
      },
      {}
    );

    expect(result).toBeDefined();
    expect(result.records).toHaveLength(2);
    expect(result.records[0].fields.Name).toBe("John");
    expect(result.records[1].fields.Name).toBe("Jane");
  });

  it("should handle API errors", async () => {
    // Mock Airtable to throw an error
    (Airtable as any).mockImplementationOnce(() => ({
      base: vi.fn().mockImplementationOnce(() => {
        throw new Error("NOT_FOUND");
      }),
    }));

    await expect(
      tool.execute(
        {
          baseId: "invalid-base",
          tableId: "table123",
          searchField: "Name",
          searchType: "equals",
          searchValue: "John",
        },
        {}
      )
    ).rejects.toThrow("Base or table not found");
  });

  it("should handle authentication errors", async () => {
    // Mock Airtable to throw an authentication error
    (Airtable as any).mockImplementationOnce(() => ({
      base: vi.fn().mockImplementationOnce(() => {
        throw new Error("AUTHENTICATION_REQUIRED");
      }),
    }));

    await expect(
      tool.execute(
        {
          baseId: "base123",
          tableId: "table123",
          searchField: "Name",
          searchType: "equals",
          searchValue: "John",
        },
        {}
      )
    ).rejects.toThrow("Invalid access token");
  });
});
