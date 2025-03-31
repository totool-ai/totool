# Totool

An SDK agnostic tool library for AI agents written in TypeScript.
Use tools from this library with [Vercel AI SDK](https://github.com/vercel/ai), [Langchain](https://github.com/langchain-ai/langchainjs) or other SDKs.

## Installation

```bash
npm install totool
```

## Building a Tool

To create a new tool, extend the `ToTool` class and implement the `execute` method. Here's a step-by-step guide:

### 1. Define Your Tool's Schema

First, define your tool's input schema using Zod:

```typescript
import { z } from "zod";

// Define your tool's input schema
const inputSchema = z.object({
  query: z.string().describe("The search query"),
  pageSize: z.number().optional().describe("Number of results to return"),
});

// Define your tool's auth schema
const authSchema = z.object({
  apiKey: z.string().describe("API key for authentication"),
});

// Define tool metadata
const name = "search";
const description = "Search for items in a database";
const service = "database";
```

### 2. Create Your Tool Class

Extend the `ToTool` class and implement the `execute` method:

```typescript
import { ToTool, RuntimeConfig } from "totool";

// Define your tool's response type
interface SearchResponse {
  results: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export class SearchTool extends ToTool<{ apiKey: string }, SearchResponse> {
  constructor({
    auth,
    predefinedParameters,
  }: {
    auth: { apiKey: string };
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
  ): Promise<SearchResponse> {
    // Implement your tool's logic here
    // Use this.auth.apiKey for authentication
    // Return the response in the expected format
    return {
      results: [
        {
          id: "1",
          title: "Example Result",
          description: "This is an example search result",
        },
      ],
    };
  }
}
```

### Constructor Parameters

The `ToTool` constructor accepts the following parameters:

- `name`: A string identifying your tool
- `description`: A string describing what your tool does
- `parameters`: A Zod schema defining your tool's input parameters
- `service`: A string identifying the service your tool interacts with
- `auth`: An object containing authentication details
- `predefinedParameters`: Optional parameters that are pre-filled when the tool is instantiated

### Child Class Constructor

When extending `ToTool`, your child class constructor should:

1. Accept an object with `auth` and optional `predefinedParameters`
2. Pass these parameters to the parent constructor
3. Type the `auth` parameter according to your tool's auth schema

Example:

```typescript
constructor({
  auth,
  predefinedParameters,
}: {
  auth: { apiKey: string };
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
```

### Using Your Tool

Once you've created your tool, you can use it with various AI SDKs:

#### With Vercel AI SDK

```typescript
import { SearchTool } from "./search-tool";

const tool = new SearchTool({
  auth: { apiKey: process.env.API_KEY },
  predefinedParameters: { pageSize: 10 },
});

const aiSdkTool = await tool.aiSdkTool();
```

#### With Langchain

```typescript
import { SearchTool } from "./search-tool";

const tool = new SearchTool({
  auth: { apiKey: process.env.API_KEY },
});

const langchainTool = await tool.langchainTool();
```

## Error Handling

The `execute` method should handle errors appropriately:

```typescript
async execute(input: Input, config: RuntimeConfig): Promise<Response> {
  try {
    // Your tool's logic here
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to execute tool: ${error.message}`);
    }
    throw new Error("Failed to execute tool: Unknown error");
  }
}
```

## Example Tools

Check out our example tools in the `packages` directory:

- [Airtable Tools](packages/airtable)
- [Notion Tools](packages/notion)

These examples demonstrate how to implement tools for different services.
