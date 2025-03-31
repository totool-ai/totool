import { z } from "zod";

// Input schema - no parameters needed as we're just listing bases
export const inputSchema = z.object({});

// Auth schema - we need the access token
export const authSchema = z.object({
  accessToken: z.string().describe("Airtable personal access token"),
});

// Tool metadata
export const name = "list-bases";
export const description =
  "List all Airtable bases accessible with the provided access token";
export const service = "airtable";
