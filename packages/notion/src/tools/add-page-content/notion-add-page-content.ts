import { Client } from "@notionhq/client";
import { ToTool, RuntimeConfig } from "totool";
import {
  name,
  description,
  service,
  inputSchema,
} from "../../schemas/notion-add-page-content";
import { Auth, authSchema } from "../../schemas/auth";
import { z } from "zod";
import type { BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";

export type Input = z.infer<typeof inputSchema>;

export class NotionAddPageContentTool extends ToTool<Auth, any> {
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

  private transformBlock(block: Input["children"][number]): BlockObjectRequest {
    const { type } = block;

    switch (type) {
      case "paragraph":
        return {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: block.paragraph.text.content,
                },
              },
            ],
          },
        };
      case "heading_1":
        return {
          object: "block",
          type: "heading_1",
          heading_1: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: block.heading_1.text.content,
                },
              },
            ],
          },
        };
      case "heading_2":
        return {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: block.heading_2.text.content,
                },
              },
            ],
          },
        };
      case "heading_3":
        return {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: block.heading_3.text.content,
                },
              },
            ],
          },
        };
      case "bulleted_list_item":
        return {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: block.bulleted_list_item.text.content,
                },
              },
            ],
          },
        };
      default:
        throw new Error(`Unsupported block type: ${type}`);
    }
  }

  async execute(input: Input, config: RuntimeConfig): Promise<any> {
    const notion = new Client({
      auth: this.auth.token,
    });

    try {
      // First verify that the block exists
      try {
        await notion.blocks.retrieve({ block_id: input.block_id });
      } catch (error) {
        throw new Error(
          `Block with ID ${input.block_id} not found or not accessible`
        );
      }

      // Add the content blocks
      const response = await notion.blocks.children.append({
        block_id: input.block_id,
        children: input.children.map((block) => this.transformBlock(block)),
      });

      return {
        results: response.results,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to add content to Notion page: ${error.message}`
        );
      }
      throw error;
    }
  }
}
