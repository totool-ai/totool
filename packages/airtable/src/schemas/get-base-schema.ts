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
 * Input schema for Get Base Schema
 */
export const inputSchema = z.object({
  baseId: z
    .string()
    .describe("The ID of the Airtable base to retrieve schema from"),
});

/**
 * Metadata for the get-base-schema tool
 */
export const name = "get-base-schema";
export const description =
  "Retrieves the schema of an Airtable base, including tables and fields.";
export const service = "airtable";
