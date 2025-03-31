import { describe, it, expect, beforeAll } from "vitest";
import { ListRecordsTool } from "./list-records";
import dotenv from "dotenv";

dotenv.config();

describe("ListRecordsTool E2E", () => {
  let tool: ListRecordsTool;

  beforeAll(() => {
    const accessToken = process.env.AIRTABLE_ACCESS_TOKEN;
    const baseId = process.env.AIRTABLE_TEST_BASE_ID;
    const tableId = process.env.AIRTABLE_TEST_TABLE_ID;

    if (!accessToken) {
      throw new Error("AIRTABLE_ACCESS_TOKEN is required for E2E tests");
    }
    if (!baseId) {
      throw new Error("AIRTABLE_TEST_BASE_ID is required for E2E tests");
    }
    if (!tableId) {
      throw new Error("AIRTABLE_TEST_TABLE_ID is required for E2E tests");
    }

    tool = new ListRecordsTool({
      auth: { accessToken },
    });
  });

  it("should list records from a real Airtable table", async () => {
    const result = await tool.execute(
      {
        baseId: process.env.AIRTABLE_TEST_BASE_ID!,
        tableId: process.env.AIRTABLE_TEST_TABLE_ID!,
        pageSize: 10,
      },
      {} as any
    );

    expect(result).toBeDefined();
    expect(result.records).toBeInstanceOf(Array);
    expect(result.records.length).toBeGreaterThan(0);

    // Check record structure
    const record = result.records[0];
    expect(record).toHaveProperty("id");
    expect(record).toHaveProperty("createdTime");
    expect(record).toHaveProperty("fields");
    expect(typeof record.id).toBe("string");
    expect(typeof record.createdTime).toBe("string");
    expect(typeof record.fields).toBe("object");
  }, 30000);

  it("should handle invalid base ID", async () => {
    await expect(
      tool.execute(
        {
          baseId: "invalid-base-id",
          tableId: process.env.AIRTABLE_TEST_TABLE_ID!,
        },
        {} as any
      )
    ).rejects.toThrow();
  }, 30000);

  it("should handle invalid table ID", async () => {
    await expect(
      tool.execute(
        {
          baseId: process.env.AIRTABLE_TEST_BASE_ID!,
          tableId: "invalid-table-id",
        },
        {} as any
      )
    ).rejects.toThrow();
  }, 30000);

  it("should handle invalid access token", async () => {
    const invalidTool = new ListRecordsTool({
      auth: { accessToken: "invalid-token" },
    });

    await expect(
      invalidTool.execute(
        {
          baseId: process.env.AIRTABLE_TEST_BASE_ID!,
          tableId: process.env.AIRTABLE_TEST_TABLE_ID!,
        },
        {} as any
      )
    ).rejects.toThrow();
  }, 30000);
});
