import Airtable from "airtable";
import { z } from "zod";
import { ToTool, RuntimeConfig } from "totool";
import {
  authSchema,
  inputSchema,
  name,
  description,
  service,
} from "../../schemas/get-base-schema";

type Input = z.infer<typeof inputSchema>;

interface AirtableField {
  id: string;
  name: string;
  type: string;
  options?: Record<string, unknown>;
}

interface AirtableTable {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: AirtableField[];
}

interface AirtableMetaResponse {
  tables: AirtableTable[];
}

export interface BaseSchemaResponse {
  tables: AirtableTable[];
}

export class GetBaseSchemaTool extends ToTool<
  { accessToken: string },
  BaseSchemaResponse
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
    input: { baseId: string },
    config: RuntimeConfig
  ): Promise<BaseSchemaResponse> {
    try {
      const response = await fetch(
        `https://api.airtable.com/v0/meta/bases/${input.baseId}/tables`,
        {
          headers: {
            Authorization: `Bearer ${this.auth.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as AirtableMetaResponse;
      return {
        tables: data.tables.map((table) => ({
          id: table.id,
          name: table.name,
          primaryFieldId: table.primaryFieldId,
          fields: table.fields.map((field) => ({
            id: field.id,
            name: field.name,
            type: field.type,
            options: field.options,
          })),
        })),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve base schema: ${error.message}`);
      }
      throw new Error("Failed to retrieve base schema: Unknown error");
    }
  }
}
