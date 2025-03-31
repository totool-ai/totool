import Airtable from "airtable";
import { z } from "zod";
import { ToTool, RuntimeConfig } from "totool";
import {
  authSchema,
  inputSchema,
  name,
  description,
  service,
  CreateRecordResponse,
} from "../../schemas/create-record";

type Input = z.infer<typeof inputSchema>;

export class CreateRecordTool extends ToTool<
  { accessToken: string },
  CreateRecordResponse
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
  ): Promise<CreateRecordResponse> {
    try {
      // Initialize Airtable client
      const airtable = new Airtable({ apiKey: this.auth.accessToken });
      const base = airtable.base(input.baseId);
      const table = base.table(input.tableId);

      // Create the record
      const records = await table.create([
        {
          fields: input.fields,
        },
      ]);

      // Get the first record (we only created one)
      const record = records[0];

      // Return the created record
      return {
        id: record.id,
        createdTime: record._rawJson.createdTime,
        fields: record.fields,
      };
    } catch (error) {
      // Handle common Airtable API errors
      if (error instanceof Error) {
        if (error.message.includes("NOT_FOUND")) {
          throw new Error("Base or table not found");
        }
        if (error.message.includes("INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND")) {
          throw new Error("Invalid permissions or model not found");
        }
        if (error.message.includes("INVALID_VALUE_FOR_COLUMN")) {
          throw new Error("Invalid value for column");
        }
        throw new Error(`Failed to create record: ${error.message}`);
      }
      throw new Error("Failed to create record: Unknown error");
    }
  }
}
