import { Client } from "@notionhq/client";
import { ToTool, RuntimeConfig } from "totool";
import {
  name,
  description,
  service,
  inputSchema,
} from "../../schemas/notion-search";
import { Auth, authSchema } from "../../schemas/auth";
import { z } from "zod";

export type Input = z.infer<typeof inputSchema>;

export class NotionSearchTool extends ToTool<Auth, any> {
  constructor({
    auth,
    predefinedParameters,
  }: {
    auth: { token: string; version: string };
    predefinedParameters?: Record<string, string>;
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

  async execute(input: Input, config: RuntimeConfig): Promise<any> {
    const notion = new Client({
      auth: this.auth.token,
    });

    try {
      const response = await notion.search({
        query: input.query,
        page_size: input.pageSize,
        start_cursor: input.startCursor,
      });

      return {
        type: response.type,
        page_or_database: response.page_or_database,
        object: response.object,
        results: response.results,
        next_cursor: response.next_cursor,
        has_more: response.has_more,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Notion search failed: ${error.message}`);
      }
      throw error;
    }
  }
}
