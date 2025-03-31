import { z } from "zod";

/**
 * Auth schema for Airtable
 * This is the API key/secret text information needed to authenticate with Airtable
 */
export const authSchema = z.object({
  accessToken: z
    .string()
    .describe("Personal access token for Airtable API authentication"),
});

/**
 * Input schema for Create Record
 * Basic parameters needed to identify the table and fields to create
 */
export const inputSchema = z.object({
  baseId: z.string().describe("The ID of the Airtable base"),
  tableId: z.string().describe("The ID of the table to create a record in"),
  fields: z
    .record(z.any())
    .describe("The field values for the new record, keyed by field name"),
});

/**
 * Response type for record creation
 */
export interface CreateRecordResponse {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>;
}

/**
 * Metadata for the create-record tool
 */
export const name = "create-record";
export const description =
  "Create a new record in a specified Airtable table. Returns the created record with its ID, creation time, and field values.";
export const service = "airtable";
