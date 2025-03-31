import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListBasesTool } from "./list-bases";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ListBasesTool", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Default success response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          bases: [
            {
              id: "app123",
              name: "Test Base",
              permissionLevel: "create",
            },
          ],
        }),
    });
  });

  it("should list bases successfully", async () => {
    const tool = new ListBasesTool({
      auth: { accessToken: "test-token" },
    });
    const result = await tool.execute({}, {});

    expect(result).toEqual({
      bases: [
        {
          id: "app123",
          name: "Test Base",
          permissionLevel: "create",
        },
      ],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.airtable.com/v0/meta/bases",
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

    const tool = new ListBasesTool({
      auth: { accessToken: "test-token" },
    });
    await expect(tool.execute({}, {})).rejects.toThrow(
      "Failed to list bases: API Error"
    );
  });
});
