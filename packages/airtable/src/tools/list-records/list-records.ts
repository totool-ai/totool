import Airtable from "airtable";
import { z } from "zod";
import { ToTool, RuntimeConfig } from "totool";
import {
  authSchema,
  inputSchema,
  name,
  description,
  service,
  ListRecordsResponse,
} from "../../schemas/list-records";

type Input = z.infer<typeof inputSchema>;
type FieldSet = Record<string, unknown>;

export class ListRecordsTool extends ToTool<
  { accessToken: string },
  ListRecordsResponse
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
  ): Promise<ListRecordsResponse> {
    try {
      const airtable = new Airtable({ apiKey: this.auth.accessToken });
      const base = airtable.base(input.baseId);
      const table = base.table(input.tableId);

      const options: Airtable.SelectOptions<FieldSet> = {};
      if (input.pageSize) {
        options.pageSize = input.pageSize;
      }
      if (input.maxRecords) {
        options.maxRecords = input.maxRecords;
      }

      const records = await table.select(options).all();

      return {
        records: records.map((record) => ({
          id: record.id,
          createdTime: record._rawJson.createdTime,
          fields: record.fields,
        })),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list records: ${error.message}`);
      }
      throw new Error("Failed to list records: Unknown error");
    }
  }
}
