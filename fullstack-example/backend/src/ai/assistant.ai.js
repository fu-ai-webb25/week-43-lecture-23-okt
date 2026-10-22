import { tools } from "./tools.ai.js";
import { llm } from "../config/ollama.config.js";
import { ToolMessage } from "@langchain/core/messages";
import { assistantPrompt } from "./prompts.ai.js";

const llmWithTools = llm.bindTools(tools);

export const invokeAssistant = async (question, history) => {
const messages = await assistantPrompt.formatMessages({
    question,
    history,
  });

  const response = await llmWithTools.invoke(messages);

  if (!response.tool_calls?.length) {
    return response;
  }

  const toolMessages = [];

  for (const toolCall of response.tool_calls) {
    const selectedTool = tools.find(
      (tool) => tool.name === toolCall.name
    );

    if (!selectedTool) {
      throw new Error(`Unknown tool: ${toolCall.name}`);
    }

    const result = await selectedTool.invoke(toolCall.args);

    toolMessages.push(
      new ToolMessage({
        content: result,
        tool_call_id: toolCall.id,
      })
    );
  }

  return await llmWithTools.invoke([
    ...messages,
    response,
    ...toolMessages,
  ]);
};