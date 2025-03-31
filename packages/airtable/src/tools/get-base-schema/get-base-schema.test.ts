import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetBaseSchemaTool } from "./get-base-schema";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("GetBaseSchemaTool", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Default success response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          tables: [
            {
              id: "tbl123",
              name: "Test Table",
              primaryFieldId: "fld123",
              fields: [
                {
                  id: "fld123",
                  name: "Name",
                  type: "singleLineText",
                  options: {},
                },
              ],
            },
          ],
        }),
    });
  });

  it("should retrieve base schema successfully", async () => {
    const tool = new GetBaseSchemaTool({
      auth: { accessToken: "test-token" },
    });
    const result = await tool.execute({ baseId: "app123" }, {});

    expect(result).toEqual({
      tables: [
        {
          id: "tbl123",
          name: "Test Table",
          primaryFieldId: "fld123",
          fields: [
            {
              id: "fld123",
              name: "Name",
              type: "singleLineText",
              options: {},
            },
          ],
        },
      ],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.airtable.com/v0/meta/bases/app123/tables",
      {
        headers: {
          Authorization: "Bearer test-token",
        },
      }
    );
  });

  it("should handle API errors", async () => {
    // Setup error case
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "API Error",
    });

    const tool = new GetBaseSchemaTool({
      auth: { accessToken: "test-token" },
    });
    await expect(tool.execute({ baseId: "app123" }, {})).rejects.toThrow(
      "Failed to retrieve base schema: API Error"
    );
  });
});
