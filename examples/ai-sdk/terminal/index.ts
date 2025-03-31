import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import dotenv from "dotenv";
import * as readline from "node:readline/promises";
import { NotionSearchTool, NotionCreatePageTool } from "@totool/notion";

dotenv.config();

// verify that the environment variables are set
if (!process.env.NOTION_API_KEY || !process.env.NOTION_ROOT_PAGE_ID) {
  throw new Error("NOTION_API_KEY and NOTION_ROOT_PAGE_ID must be set");
}

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: CoreMessage[] = [];

async function main() {
  const searchPostTool = new NotionSearchTool({
    auth: {
      token: process.env.NOTION_API_KEY!,
      version: "2022-06-28",
    },
  });
  const postPageTool = new NotionCreatePageTool({
    auth: {
      token: process.env.NOTION_API_KEY!,
      version: "2022-06-28",
    },
    predefinedParameters: {
      parent_id: process.env.NOTION_ROOT_PAGE_ID!,
    },
  });

  while (true) {
    const userInput = await terminal.question("You: ");

    messages.push({ role: "user", content: userInput });

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      tools: {
        [postPageTool.getToolName()]: await postPageTool.aiSdkTool(),
        [searchPostTool.getToolName()]: await searchPostTool.aiSdkTool(),
      },
      maxSteps: 5,
      onStepFinish: (step) => {
        console.log(JSON.stringify(step, null, 2));
      },
    });

    let fullResponse = "";
    process.stdout.write("\nAssistant: ");
    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write("\n\n");

    messages.push({ role: "assistant", content: fullResponse });
  }
}

main().catch(console.error);
