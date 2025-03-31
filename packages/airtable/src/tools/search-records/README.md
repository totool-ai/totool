# Airtable Search Records Tool

This tool allows you to search records in an Airtable table using simple field comparisons. It supports basic text search operations like equals, not equals, contains, and doesn't contain.

## Features

- Search records using field comparisons
- Support for multiple search types:
  - `equals`: Exact match
  - `notEquals`: Exact non-match
  - `contains`: Substring match
  - `notContains`: Substring non-match
- Pagination support (optional)
- Error handling for common Airtable API errors
- Type-safe input and output

## Environment Setup

The following environment variables are required:

```env
AIRTABLE_ACCESS_TOKEN=your_access_token_here
```

For running tests, additional variables are needed:

```env
AIRTABLE_TEST_BASE_ID=your_test_base_id
AIRTABLE_TEST_TABLE_ID=your_test_table_id
```

## Usage

### Basic Usage

```typescript
import { SearchRecordsTool } from "@totool/airtable";

const tool = new SearchRecordsTool({
  auth: { accessToken: process.env.AIRTABLE_ACCESS_TOKEN },
});

const result = await tool.execute({
  baseId: "your_base_id",
  tableId: "your_table_id",
  searchField: "Name",
  searchType: "contains",
  searchValue: "John",
  pageSize: 100, // optional
});
```

### With AI SDK

```typescript
const result = streamText({
  model: openai("gpt-4"),
  messages: [
    {
      role: "user",
      content: "Find all records where the Name contains 'John'",
    },
  ],
  tools: {
    [searchRecordsTool.getToolName()]: await searchRecordsTool.aiSDKTool(),
  },
});
```

### With LangChain

```typescript
const tools = [await searchRecordsTool.langchainTool()];
const agent = new OpenAI().bindTools(tools);

const result = await agent.invoke([
  {
    role: "user",
    content: "Find all records where the Name contains 'John'",
  },
]);
```

## Limitations

- Only supports basic text and numeric comparisons
- No support for complex formula combinations
- No support for field metadata
- No support for sorting or complex filtering
- Maximum page size of 100 records
- Rate limits apply as per Airtable's API guidelines
