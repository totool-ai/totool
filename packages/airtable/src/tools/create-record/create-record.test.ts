import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateRecordTool } from "./create-record";
import Airtable from "airtable";

// Mock Airtable
vi.mock("airtable", () => {
  const mockAirtable = {
    base: vi.fn().mockReturnValue({
      table: vi.fn().mockReturnValue({
        create: vi.fn().mockResolvedValue([
          {
            id: "rec123",
            _rawJson: {
              createdTime: "2024-01-01T00:00:00.000Z",
            },
            fields: {
              Name: "Test Record",
              Description: "A test record",
            },
          },
        ]),
      }),
    }),
    _apiKey: "test-token",
    _apiVersion: "v0",
    _apiVersionMajor: "0",
    _customHeaders: {},
    _requestTimeout: 30000,
    _noRetryIfRateLimited: false,
    _endpointUrl: "https://api.airtable.com",
  };

  return {
    default: vi.fn().mockImplementation(() => mockAirtable),
  };
});

describe("CreateRecordTool", () => {
  let tool: CreateRecordTool;

  beforeEach(() => {
    tool = new CreateRecordTool({
      auth: { accessToken: "test-token" },
    });
  });

  it("should create a record with valid input", async () => {
    const result = await tool.execute(
      {
        baseId: "base123",
        tableId: "table123",
        fields: {
          Name: "Test Record",
          Description: "A test record",
        },
      },
      {}
    );

    expect(result).toEqual({
      id: "rec123",
      createdTime: "2024-01-01T00:00:00.000Z",
      fields: {
        Name: "Test Record",
        Description: "A test record",
      },
    });
  });

  it("should handle API errors", async () => {
    const mockAirtable = {
      base: vi.fn().mockReturnValue({
        table: vi.fn().mockReturnValue({
          create: vi.fn().mockRejectedValue(new Error("NOT_FOUND")),
        }),
      }),
      _apiKey: "test-token",
      _apiVersion: "v0",
      _apiVersionMajor: "0",
      _customHeaders: {},
      _requestTimeout: 30000,
      _noRetryIfRateLimited: false,
      _endpointUrl: "https://api.airtable.com",
    };

    vi.mocked(Airtable).mockImplementationOnce(() => mockAirtable);

    await expect(
      tool.execute(
        {
          baseId: "base123",
          tableId: "table123",
          fields: {
            Name: "Test Record",
          },
        },
        {}
      )
    ).rejects.toThrow("Base or table not found");
  });

  it("should handle invalid field values", async () => {
    const mockAirtable = {
      base: vi.fn().mockReturnValue({
        table: vi.fn().mockReturnValue({
          create: vi
            .fn()
            .mockRejectedValue(new Error("INVALID_VALUE_FOR_COLUMN")),
        }),
      }),
      _apiKey: "test-token",
      _apiVersion: "v0",
      _apiVersionMajor: "0",
      _customHeaders: {},
      _requestTimeout: 30000,
      _noRetryIfRateLimited: false,
      _endpointUrl: "https://api.airtable.com",
    };

    vi.mocked(Airtable).mockImplementationOnce(() => mockAirtable);

    await expect(
      tool.execute(
        {
          baseId: "base123",
          tableId: "table123",
          fields: {
            Name: "Test Record",
          },
        },
        {}
      )
    ).rejects.toThrow("Invalid value for column");
  });
});
