# @totool/notion

A collection of Notion tools for AI agents, starting with the search functionality.

## Installation

```bash
npm install @totool/notion
# or
yarn add @totool/notion
# or
pnpm add @totool/notion
```

## Environment Variables

To use the Notion tools, you need to set up the following environment variable:

- `NOTION_API_KEY`: Your Notion integration token. You can get this by creating a new integration in your [Notion Integrations](https://www.notion.so/my-integrations) page.

## Available Tools

### Notion Search Tool

The Notion Search tool allows you to search across all pages and databases that have been shared with your integration.

#### Features

- Search pages and databases by text query
- Support for pagination
- Error handling for API failures
- Full response type support

#### Usage

##### With AI SDK

```typescript
import { notionSearchTool } from "@totool/notion";

const messages = [
  {
    role: "user",
    content: "Find all pages about project planning in Notion",
  },
];

const result = streamText({
  model: openai("gpt-4"),
  messages,
  tools: {
    [notionSearchTool.getToolName()]: await notionSearchTool.aiSDKTool(),
  },
  maxSteps: 5,
  onStepFinish: (step) => {
    console.log(JSON.stringify(step, null, 2));
  },
});
```

##### With LangChain

```typescript
import { notionSearchTool } from "@totool/notion";

const tools = [await notionSearchTool.langchainTool()];
const toolNodeForGraph = new ToolNode(tools);
const modelWithTools = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0.2,
}).bindTools(tools);

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNodeForGraph)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])
  .addEdge("tools", "agent");

const agent = workflow.compile();
const result = await agent.invoke({ messages });
```

#### Input Parameters

- `query` (required): The text to search for in pages and databases
- `pageSize` (optional): Number of results to return per page (default: 100)
- `startCursor` (optional): Cursor for pagination

#### Response Format

The tool returns a response object with the following structure:

```typescript
{
  type: "page_or_database",
  page_or_database: {},
  object: "list",
  results: [
    {
      id: string,
      type: "page" | "database",
      object: "page" | "database",
      properties: {
        // Page or database properties
      }
    }
  ],
  next_cursor: string | null,
  has_more: boolean
}
```

### Notion Create Page Tool

The Notion Create Page tool allows you to create new pages in your Notion workspace as children of existing pages or databases.

#### Features

- Create pages as children of existing pages or databases
- Set page title and basic text properties
- Validate parent page/database existence
- Error handling for common cases

#### Usage

##### With AI SDK

```typescript
import { notionCreatePageTool } from "@totool/notion";

const messages = [
  {
    role: "user",
    content: "Create a new page in my Notion workspace",
  },
];

const result = streamText({
  model: openai("gpt-4"),
  messages,
  tools: {
    [notionCreatePageTool.getToolName()]:
      await notionCreatePageTool.aiSDKTool(),
  },
  maxSteps: 5,
  onStepFinish: (step) => {
    console.log(JSON.stringify(step, null, 2));
  },
});
```

##### With LangChain

```typescript
import { notionCreatePageTool } from "@totool/notion";

const tools = [await notionCreatePageTool.langchainTool()];
const toolNodeForGraph = new ToolNode(tools);
const modelWithTools = new ChatOpenAI({
  model: "gpt-4",
  temperature: 0.2,
}).bindTools(tools);

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNodeForGraph)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])
  .addEdge("tools", "agent");

const agent = workflow.compile();
const result = await agent.invoke({ messages });
```

#### Input Parameters

- `parent_id` (required): The ID of the parent page or database where the new page will be created
- `title` (required): The title of the new page
- `properties` (optional): Basic text properties for the page

## Development

### Running Tests

```bash
pnpm test
```

### Building

```bash
pnpm build
```

## License

MIT
