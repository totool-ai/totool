import Airtable from "airtable";
import { ToTool, RuntimeConfig } from "totool";
import { z } from "zod";
import {
  authSchema,
  inputSchema,
  name,
  description,
  service,
  SearchRecordsResponse,
} from "../../schemas/search-records";

type Input = z.infer<typeof inputSchema>;

/**
 * Maps search types to Airtable formula syntax
 */
const searchTypeToFormula = {
  equals: (field: string, value: string) => `{${field}} = "${value}"`,
  notEquals: (field: string, value: string) => `{${field}} != "${value}"`,
  contains: (field: string, value: string) =>
    `FIND("${value}", {${field}}) > 0`,
  notContains: (field: string, value: string) =>
    `FIND("${value}", {${field}}) = 0`,
};

export class SearchRecordsTool extends ToTool<
  { accessToken: string },
  SearchRecordsResponse
> {
  constructor({
    auth,
    predefinedParameters,
  }: {
    auth: { accessToken: string };
    predefinedParameters?: Partial<Input>;
  }) {
    super({
      name,
      description,
      parameters: inputSchema,
      service,
      auth,
      predefinedParameters,
    });
  }

  async execute(
    input: Input,
    config: RuntimeConfig
  ): Promise<SearchRecordsResponse> {
    try {
      const base = new Airtable({ apiKey: this.auth.accessToken }).base(
        input.baseId
      );
      const table = base.table(input.tableId);

      // Construct the formula based on search type
      const formula = searchTypeToFormula[input.searchType](
        input.searchField,
        input.searchValue
      );

      // Set up options for the query
      const options: Airtable.SelectOptions<Airtable.FieldSet> = {
        filterByFormula: formula,
      };

      // Only add pageSize if it's provided and is a number
      if (typeof input.pageSize === "number") {
        options.pageSize = input.pageSize;
      }

      // Log the query for debugging
      console.log("Executing Airtable query with options:", {
        baseId: input.baseId,
        tableId: input.tableId,
        formula,
        pageSize: options.pageSize,
      });

      // Execute the query
      const records = await table.select(options).all();

      // Log the response for debugging
      console.log(`Found ${records.length} records`);

      // Transform the records into the expected response format
      return {
        records: records.map((record) => ({
          id: record.id,
          createdTime: record._rawJson.createdTime,
          fields: record.fields,
        })),
      };
    } catch (error) {
      // Log the full error for debugging
      console.error("Error in SearchRecordsTool:", error);

      if (error instanceof Error) {
        // Handle specific Airtable API errors
        if (error.message.includes("NOT_FOUND")) {
          throw new Error(
            `Base or table not found. Please check the baseId and tableId.`
          );
        }
        if (error.message.includes("AUTHENTICATION_REQUIRED")) {
          throw new Error(
            `Invalid access token. Please check your credentials.`
          );
        }
        if (error.message.includes("INVALID_FIELD_NAME")) {
          throw new Error(`Invalid field name: ${input.searchField}`);
        }
        if (error.message.includes("INVALID_FORMULA")) {
          throw new Error(`Invalid formula generated for search criteria`);
        }
        throw new Error(`Failed to search records: ${error.message}`);
      }
      throw new Error(`Failed to search records: ${String(error)}`);
    }
  }
}
