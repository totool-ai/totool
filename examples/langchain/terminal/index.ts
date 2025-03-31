import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import dotenv from "dotenv";
import * as readline from "node:readline/promises";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  StateGraph,
  MessagesAnnotation,
  START,
  END,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  SearchRecordsTool,
  ListBasesTool,
  GetBaseSchemaTool,
  CreateRecordTool,
  ListRecordsTool,
} from "@totool/airtable";

import { NotionCreatePageTool, NotionAddPageContentTool } from "@totool/notion";

dotenv.config();

// verify that the environment variables are set
if (
  !process.env.AIRTABLE_API_KEY ||
  !process.env.AIRTABLE_BASE_ID ||
  !process.env.AIRTABLE_TABLE_ID ||
  !process.env.NOTION_API_KEY ||
  !process.env.NOTION_TEST_PARENT_PAGE_ID
) {
  throw new Error(
    "AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID, NOTION_API_KEY, and NOTION_TEST_PARENT_PAGE_ID must be set"
  );
}

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: BaseMessage[] = [];

async function main() {
  const searchRecordsTool = new SearchRecordsTool({
    auth: {
      accessToken: process.env.AIRTABLE_API_KEY!,
    },
    predefinedParameters: {
      baseId: process.env.AIRTABLE_BASE_ID!,
      tableId: process.env.AIRTABLE_TABLE_ID!,
    },
  });

  const createRecordTool = new CreateRecordTool({
    auth: {
      accessToken: process.env.AIRTABLE_API_KEY!,
    },
    predefinedParameters: {
      baseId: process.env.AIRTABLE_BASE_ID!,
      tableId: process.env.AIRTABLE_TABLE_ID!,
    },
  });

  const listRecordsTool = new ListRecordsTool({
    auth: {
      accessToken: process.env.AIRTABLE_API_KEY!,
    },
    predefinedParameters: {
      baseId: process.env.AIRTABLE_BASE_ID!,
    },
  });

  const schemaTool = new GetBaseSchemaTool({
    auth: {
      accessToken: process.env.AIRTABLE_API_KEY!,
    },
    predefinedParameters: {
      baseId: process.env.AIRTABLE_BASE_ID!,
    },
  });

  const createPageTool = new NotionCreatePageTool({
    auth: {
      token: process.env.NOTION_API_KEY!,
      version: "2022-06-28",
    },
    predefinedParameters: {
      parent_id: process.env.NOTION_TEST_PARENT_PAGE_ID!,
    },
  });

  const addPageContentTool = new NotionAddPageContentTool({
    auth: {
      token: process.env.NOTION_API_KEY!,
      version: "2022-06-28",
    },
    predefinedParameters: {
      parent_id: process.env.NOTION_TEST_PARENT_PAGE_ID!,
    },
  });

  while (true) {
    const userInput = await terminal.question("You: ");

    messages.push(new HumanMessage(userInput));

    const tools = await Promise.all([
      createRecordTool.langchainTool(),
      searchRecordsTool.langchainTool(),
      listRecordsTool.langchainTool(),
      schemaTool.langchainTool(),
      createPageTool.langchainTool(),
      addPageContentTool.langchainTool(),
    ]);

    const toolNodeForGraph = new ToolNode(tools);
    const modelWithTools = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.2,
    }).bindTools(tools);

    const shouldContinue = (state: typeof MessagesAnnotation.State) => {
      const { messages } = state;
      const lastMessage = messages[messages.length - 1];
      if (
        "tool_calls" in lastMessage &&
        Array.isArray(lastMessage.tool_calls) &&
        lastMessage.tool_calls?.length
      ) {
        return "tools";
      }
      return END;
    };

    const callModel = async (state: typeof MessagesAnnotation.State) => {
      const { messages } = state;
      const response = await modelWithTools.invoke(messages);
      return { messages: response };
    };

    const workflow = new StateGraph(MessagesAnnotation)
      // Define the two nodes we will cycle between
      .addNode("agent", callModel)
      .addNode("tools", toolNodeForGraph)
      .addEdge(START, "agent")
      .addConditionalEdges("agent", shouldContinue, ["tools", END])
      .addEdge("tools", "agent");

    const agent = workflow.compile();

    const result = await agent.invoke({ messages });
    const response = result.messages[result.messages.length - 1].content;

    process.stdout.write("\nAssistant: ");
    process.stdout.write(response.toString());
    process.stdout.write("\n\n");
  }
}

main().catch(console.error);
