import { describe, it, expect, beforeAll } from "vitest";
import { SearchRecordsTool } from "./search-records";
import { GetBaseSchemaTool } from "../get-base-schema/get-base-schema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

describe("SearchRecordsTool E2E", () => {
  let tool: SearchRecordsTool;
  let fieldName: string;

  beforeAll(async () => {
    // Validate required environment variables
    const requiredEnvVars = [
      "AIRTABLE_ACCESS_TOKEN",
      "AIRTABLE_TEST_BASE_ID",
      "AIRTABLE_TEST_TABLE_ID",
    ];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    // Initialize tools
    tool = new SearchRecordsTool({
      auth: { accessToken: process.env.AIRTABLE_ACCESS_TOKEN! },
    });

    // Get the base schema to find the correct field name
    const schemaTool = new GetBaseSchemaTool({
      auth: { accessToken: process.env.AIRTABLE_ACCESS_TOKEN! },
    });

    const schema = await schemaTool.execute(
      {
        baseId: process.env.AIRTABLE_TEST_BASE_ID!,
      },
      {}
    );

    // Find the table we want to search
    const table = schema.tables.find(
      (t) => t.id === process.env.AIRTABLE_TEST_TABLE_ID
    );
    if (!table) {
      throw new Error(
        `Table ${process.env.AIRTABLE_TEST_TABLE_ID} not found in schema`
      );
    }

    // Log available fields for debugging
    console.log(
      "Available fields:",
      table.fields.map((f) => ({ name: f.name, type: f.type }))
    );

    // Find the Headline field for searching
    const textField = table.fields.find(
      (f) => f.name === "Headline" && f.type === "singleLineText"
    );

    if (!textField) {
      throw new Error("Headline field not found in table");
    }

    fieldName = textField.name;
    console.log(`Using field "${fieldName}" for search tests`);
  });

  it(
    "should search records from a real Airtable table",
    async () => {
      const result = await tool.execute(
        {
          baseId: process.env.AIRTABLE_TEST_BASE_ID!,
          tableId: process.env.AIRTABLE_TEST_TABLE_ID!,
          searchField: fieldName,
          searchType: "contains",
          searchValue: "Test", // Changed to a more general search term
        },
        {}
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result.records)).toBe(true);
      if (result.records.length > 0) {
        expect(result.records[0]).toHaveProperty("id");
        expect(result.records[0]).toHaveProperty("createdTime");
        expect(result.records[0]).toHaveProperty("fields");
        expect(result.records[0].fields).toHaveProperty(fieldName);
      }
    },
    { timeout: 30000 }
  );

  it(
    "should handle invalid base ID",
    async () => {
      await expect(
        tool.execute(
          {
            baseId: "invalid-base-id",
            tableId: process.env.AIRTABLE_TEST_TABLE_ID!,
            searchField: fieldName,
            searchType: "equals",
            searchValue: "Test",
          },
          {}
        )
      ).rejects.toThrow();
    },
    { timeout: 30000 }
  );

  it(
    "should handle invalid table ID",
    async () => {
      await expect(
        tool.execute(
          {
            baseId: process.env.AIRTABLE_TEST_BASE_ID!,
            tableId: "invalid-table-id",
            searchField: fieldName,
            searchType: "equals",
            searchValue: "Test",
          },
          {}
        )
      ).rejects.toThrow();
    },
    { timeout: 30000 }
  );

  it(
    "should handle invalid access token",
    async () => {
      const invalidTool = new SearchRecordsTool({
        auth: { accessToken: "invalid-token" },
      });

      await expect(
        invalidTool.execute(
          {
            baseId: process.env.AIRTABLE_TEST_BASE_ID!,
            tableId: process.env.AIRTABLE_TEST_TABLE_ID!,
            searchField: fieldName,
            searchType: "equals",
            searchValue: "Test",
          },
          {}
        )
      ).rejects.toThrow();
    },
    { timeout: 30000 }
  );
});
