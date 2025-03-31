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
 * Input schema for Search Records
 * Basic parameters needed to identify the table and search criteria
 */
export const inputSchema = z.object({
  baseId: z.string().describe("The ID of the Airtable base"),
  tableId: z.string().describe("The ID of the table to search records in"),
  searchField: z.string().describe("The name of the field to search in"),
  searchType: z
    .enum(["equals", "notEquals", "contains", "notContains"])
    .describe("The type of search to perform"),
  searchValue: z.string().describe("The value to search for"),
  pageSize: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .describe("Number of records to return per page (max 100)"),
});

/**
 * Response type for search results
 */
export interface SearchRecordsResponse {
  records: Array<{
    id: string;
    createdTime: string;
    fields: Record<string, unknown>;
  }>;
}

/**
 * Metadata for the search-records tool
 */
export const name = "search-records";
export const description =
  "Search records in a specified Airtable table using simple field comparisons. Returns matching records with their IDs, creation times, and field values.";
export const service = "airtable";
