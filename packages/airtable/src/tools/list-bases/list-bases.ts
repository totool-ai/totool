import { z } from "zod";
import { ToTool, RuntimeConfig } from "totool";
import {
  authSchema,
  inputSchema,
  name,
  description,
  service,
} from "../../schemas/list-bases";

// Define the response type
interface AirtableBase {
  id: string;
  name: string;
  permissionLevel: string;
}

interface ListBasesResponse {
  bases: AirtableBase[];
}

interface AirtableMetaResponse {
  bases: Array<{
    id: string;
    name: string;
    permissionLevel: string;
  }>;
}

export class ListBasesTool extends ToTool<
  { accessToken: string },
  ListBasesResponse
> {
  constructor({
    auth,
    predefinedParameters,
  }: {
    auth: { accessToken: string };
    predefinedParameters?: Partial<z.infer<typeof inputSchema>>;
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
    input: z.infer<typeof inputSchema>,
    config: RuntimeConfig
  ): Promise<ListBasesResponse> {
    try {
      const response = await fetch("https://api.airtable.com/v0/meta/bases", {
        headers: {
          Authorization: `Bearer ${this.auth.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as AirtableMetaResponse;
      return {
        bases: data.bases.map((base) => ({
          id: base.id,
          name: base.name,
          permissionLevel: base.permissionLevel,
        })),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list bases: ${error.message}`);
      }
      throw new Error("Failed to list bases: Unknown error");
    }
  }
}
