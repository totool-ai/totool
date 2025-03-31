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
 * Input schema for List Records
 * Basic parameters needed to identify the table and optional pagination
 */
export const inputSchema = z.object({
  baseId: z.string().describe("The ID of the Airtable base"),
  tableId: z.string().describe("The ID of the table to list records from"),
  pageSize: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Number of records to return per page (max 100)"),
  maxRecords: z
    .number()
    .optional()
    .describe("Maximum total number of records to return"),
  offset: z
    .string()
    .optional()
    .describe("Offset for pagination, returned from previous request"),
});

/**
 * Response type for record listing
 */
export interface ListRecordsResponse {
  records: Array<{
    id: string;
    createdTime: string;
    fields: Record<string, unknown>;
  }>;
  offset?: string;
}

/**
 * Metadata for the list-records tool
 */
export const name = "list-records";
export const description =
  "List records from a specified Airtable table with optional pagination. Returns records with their IDs, creation times, and field values.";
export const service = "airtable";
