import { Client } from "@notionhq/client";
import { ToTool, RuntimeConfig } from "totool";
import {
  name,
  description,
  service,
  inputSchema,
} from "../../schemas/notion-create-page";
import { Auth, authSchema } from "../../schemas/auth";
import { z } from "zod";
import debug from "debug";

const log = debug("totool:notion:create-page");

export type Input = z.infer<typeof inputSchema>;

export class NotionCreatePageTool extends ToTool<Auth, any> {
  private notion: Client;

  constructor({
    auth,
    predefinedParameters,
  }: {
    auth: { token: string; version: string };
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

    this.notion = new Client({
      auth: auth.token,
      notionVersion: auth.version,
    });
  }

  async execute(input: Input, config: RuntimeConfig): Promise<any> {
    try {
      // Transform properties to match Notion API format
      const properties: Record<string, any> = {
        title: {
          title: [
            {
              text: {
                content: input.title,
              },
            },
          ],
        },
      };

      if (input.properties) {
        Object.entries(input.properties).forEach(([key, value]) => {
          if (value.type === "text") {
            properties[key] = {
              rich_text: [
                {
                  text: {
                    content: value.text?.content || "",
                  },
                },
              ],
            };
          } else if (value.type === "rich_text") {
            properties[key] = {
              rich_text: value.rich_text || [],
            };
          }
        });
      }

      const body = {
        parent: {
          page_id: input.parent_id,
        },
        properties,
      };

      log("body", JSON.stringify(body));

      // Create the new page
      const response = await this.notion.pages.create(body);

      return {
        id: response.id,
        object: response.object,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create Notion page: ${error.message}`);
      }
      throw error;
    }
  }
}
