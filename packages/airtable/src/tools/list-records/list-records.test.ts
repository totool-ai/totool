import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListRecordsTool } from "./list-records";
import Airtable from "airtable";

// Mock Airtable
vi.mock("airtable", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      base: vi.fn().mockReturnValue({
        table: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            all: vi.fn().mockResolvedValue([
              {
                id: "rec1",
                _rawJson: {
                  createdTime: "2024-01-01T00:00:00.000Z",
                },
                fields: {
                  Name: "Test Record 1",
                },
              },
              {
                id: "rec2",
                _rawJson: {
                  createdTime: "2024-01-02T00:00:00.000Z",
                },
                fields: {
                  Name: "Test Record 2",
                },
              },
            ]),
          }),
        }),
      }),
    })),
  };
});

describe("ListRecordsTool", () => {
  let tool: ListRecordsTool;

  beforeEach(() => {
    tool = new ListRecordsTool({
      auth: { accessToken: "test-token" },
    });
  });

  it("should list records successfully", async () => {
    const result = await tool.execute(
      {
        baseId: "test-base",
        tableId: "test-table",
      },
      {} as any
    );

    expect(result).toEqual({
      records: [
        {
          id: "rec1",
          createdTime: "2024-01-01T00:00:00.000Z",
          fields: {
            Name: "Test Record 1",
          },
        },
        {
          id: "rec2",
          createdTime: "2024-01-02T00:00:00.000Z",
          fields: {
            Name: "Test Record 2",
          },
        },
      ],
    });
  });

  it("should handle pagination parameters", async () => {
    const result = await tool.execute(
      {
        baseId: "test-base",
        tableId: "test-table",
        pageSize: 50,
        maxRecords: 100,
      },
      {} as any
    );

    expect(result).toBeDefined();
    expect(result.records).toHaveLength(2);
  });

  it("should handle API errors", async () => {
    const mockError = new Error("API Error");
    (Airtable as any).mockImplementationOnce(() => ({
      base: vi.fn().mockReturnValue({
        table: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            all: vi.fn().mockRejectedValue(mockError),
          }),
        }),
      }),
    }));

    await expect(
      tool.execute(
        {
          baseId: "test-base",
          tableId: "test-table",
        },
        {} as any
      )
    ).rejects.toThrow("Failed to list records: API Error");
  });
});
