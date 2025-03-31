import { describe, it, expect, beforeAll } from "vitest";
import { GetBaseSchemaTool } from "./get-base-schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

describe("GetBaseSchemaTool E2E", () => {
  let tool: GetBaseSchemaTool;
  let validTool: GetBaseSchemaTool;

  beforeAll(() => {
    // Validate required environment variables
    if (!process.env.AIRTABLE_ACCESS_TOKEN) {
      throw new Error("AIRTABLE_ACCESS_TOKEN is required for E2E tests");
    }
    if (!process.env.AIRTABLE_TEST_BASE_ID) {
      throw new Error("AIRTABLE_TEST_BASE_ID is required for E2E tests");
    }

    // Create tools with different auth configurations
    tool = new GetBaseSchemaTool({
      auth: { accessToken: process.env.AIRTABLE_ACCESS_TOKEN! },
    });
    validTool = new GetBaseSchemaTool({
      auth: { accessToken: process.env.AIRTABLE_ACCESS_TOKEN! },
    });
  });

  it("should retrieve base schema from a real Airtable base", async () => {
    const result = await validTool.execute(
      { baseId: process.env.AIRTABLE_TEST_BASE_ID! },
      {}
    );

    // Basic validation of the response
    expect(result).toBeDefined();
    expect(result.tables).toBeInstanceOf(Array);
    expect(result.tables.length).toBeGreaterThan(0);

    // Validate table structure
    const table = result.tables[0];
    expect(table).toHaveProperty("id");
    expect(table).toHaveProperty("name");
    expect(table).toHaveProperty("primaryFieldId");
    expect(table).toHaveProperty("fields");
    expect(table.fields).toBeInstanceOf(Array);
    expect(table.fields.length).toBeGreaterThan(0);

    // Validate field structure
    const field = table.fields[0];
    expect(field).toHaveProperty("id");
    expect(field).toHaveProperty("name");
    expect(field).toHaveProperty("type");
  }, 30000); // Increased timeout for E2E tests

  it("should handle invalid base ID", async () => {
    await expect(
      validTool.execute({ baseId: "invalid_base_id" }, {})
    ).rejects.toThrow();
  }, 30000);

  it("should handle invalid access token", async () => {
    const invalidTool = new GetBaseSchemaTool({
      auth: { accessToken: "invalid_token" },
    });

    await expect(
      invalidTool.execute({ baseId: process.env.AIRTABLE_TEST_BASE_ID! }, {})
    ).rejects.toThrow();
  }, 30000);
});
