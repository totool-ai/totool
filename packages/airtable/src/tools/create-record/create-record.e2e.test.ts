import { describe, it, expect, beforeAll } from "vitest";
import { CreateRecordTool } from "./create-record";
import { GetBaseSchemaTool } from "../get-base-schema/get-base-schema";

describe("CreateRecordTool E2E", () => {
  let tool: CreateRecordTool;
  let textField: { name: string; type: string };

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
    tool = new CreateRecordTool({
      auth: { accessToken: process.env.AIRTABLE_ACCESS_TOKEN! },
    });

    // Get the base schema to find a text field to use
    const getBaseSchemaTool = new GetBaseSchemaTool({
      auth: { accessToken: process.env.AIRTABLE_ACCESS_TOKEN! },
    });

    const schema = await getBaseSchemaTool.execute(
      {
        baseId: process.env.AIRTABLE_TEST_BASE_ID!,
      },
      {}
    );

    // Find the table we want to use
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

    // Find a text field to use for testing
    const foundTextField = table.fields.find(
      (f) => f.type === "singleLineText" || f.type === "multilineText"
    );
    if (!foundTextField) {
      throw new Error("No suitable text field found for testing");
    }

    textField = { name: foundTextField.name, type: foundTextField.type };
    console.log(`Using field "${textField.name}" for create tests`);
  });

  it(
    "should create a record in Airtable",
    async () => {
      const testValue = `Test Record ${new Date().toISOString()}`;
      const result = await tool.execute(
        {
          baseId: process.env.AIRTABLE_TEST_BASE_ID!,
          tableId: process.env.AIRTABLE_TEST_TABLE_ID!,
          fields: {
            [textField.name]: testValue,
          },
        },
        {}
      );

      // Verify the record was created with the correct field value
      expect(result.id).toBeDefined();
      expect(result.createdTime).toBeDefined();
      expect(result.fields[textField.name]).toBe(testValue);
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
            fields: {
              [textField.name]: "Test Record",
            },
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
            fields: {
              [textField.name]: "Test Record",
            },
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
      const invalidTool = new CreateRecordTool({
        auth: { accessToken: "invalid-token" },
      });

      await expect(
        invalidTool.execute(
          {
            baseId: process.env.AIRTABLE_TEST_BASE_ID!,
            tableId: process.env.AIRTABLE_TEST_TABLE_ID!,
            fields: {
              [textField.name]: "Test Record",
            },
          },
          {}
        )
      ).rejects.toThrow();
    },
    { timeout: 30000 }
  );
});
