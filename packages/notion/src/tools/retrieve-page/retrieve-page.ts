import { ToTool, RuntimeConfig } from "totool";
import { Client } from "@notionhq/client";
import { Auth } from "../../schemas/auth";
import {
  inputSchema,
  RetrievePageInput,
  name,
  description,
  service,
} from "../../schemas/retrieve-page";

export class NotionRetrievePageTool extends ToTool<Auth, any> {
  private notion: Client;

  constructor(config: {
    auth: Auth;
    predefinedParameters?: Record<string, any>;
  }) {
    super({
      name,
      description,
      parameters: inputSchema,
      service,
      auth: config.auth,
      predefinedParameters: config.predefinedParameters,
    });

    this.notion = new Client({
      auth: config.auth.token,
    });
  }

  async execute(input: RetrievePageInput, config: RuntimeConfig) {
    // Validate input format first
    if (!input.page_id) {
      throw new Error("Page ID is required");
    }

    // Validate input against schema
    const validationResult = inputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new Error(validationResult.error.errors[0].message);
    }

    try {
      const response = await this.notion.pages.retrieve({
        page_id: input.page_id,
      });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        // Handle common error cases
        if (error.message.includes("404")) {
          throw new Error(`Page not found with ID: ${input.page_id}`);
        }
        if (error.message.includes("403")) {
          throw new Error(`Access denied to page with ID: ${input.page_id}`);
        }
        throw new Error(`Failed to retrieve page: ${error.message}`);
      }
      throw error;
    }
  }
}
