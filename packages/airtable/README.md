# Airtable Tools

This package provides tools for interacting with Airtable's API. Currently, it includes a tool for retrieving base schemas.

## Installation

```bash
npm install @totool/airtable
```

## Environment Variables

The following environment variables are required:

- `AIRTABLE_ACCESS_TOKEN`: Your Airtable personal access token

## Features

### Get Base Schema

Retrieves the schema of an Airtable base, including tables and fields.

#### Usage with AI SDK

```typescript
import { GetBaseSchemaTool } from "@totool/airtable";

const tool = await new GetBaseSchemaTool().aiSdkTool();

// Use with AI SDK
const result = await tool.execute(
  { baseId: "your-base-id" },
  { accessToken: process.env.AIRTABLE_ACCESS_TOKEN }
);
```

#### Usage with LangChain

```typescript
import { GetBaseSchemaTool } from "@totool/airtable";
import { ToolNode } from "@langchain/langgraph";

const tool = new GetBaseSchemaTool();
const tools = [await tool.langchainTool()];
const toolNode = new ToolNode(tools);
```

## Response Format

The tool returns a `BaseSchemaResponse` object with the following structure:

```typescript
interface BaseSchemaResponse {
  tables: Array<{
    id: string;
    name: string;
    primaryFieldId: string;
    fields: Array<{
      id: string;
      name: string;
      type: string;
      options?: Record<string, unknown>;
    }>;
  }>;
}
```
