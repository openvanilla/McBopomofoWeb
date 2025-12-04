#!/usr/bin/env node
// import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { Service } from "./McBopomofo/Service";

const service = new Service();

const server = new Server(
  {
    name: "mcp-mcbopomofo",
    version: "1.9.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 定義工具列表
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "convertBrailleToText",
        description:
          "將台灣點字字串轉換為國字 (Convert Taiwanese Braille to Chinese text). 支援中英數混打解析 (Supports mixed input including Taiwanese Braille, Roman letters, numbers and symbols).",
        inputSchema: {
          type: "object",
          properties: {
            braille: {
              type: "string",
              description:
                "點字 Unicode 字串 (Braille Unicode String), 例如: ⠓⠩⠈⠅⠎⠐",
            },
          },
          required: ["braille"],
        },
      },
      {
        name: "convertTextToBraille",
        description:
          "將國字、數字或英文字母轉換為台灣點字 (Convert Chinese text to Taiwanese Braille).",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description:
                "包含國字 、數字或英文的字串 (Text content), 例如: ㄗㄠˇㄐㄧㄡˋ",
            },
          },
          required: ["text"],
        },
      },
    ],
  };
});

/**
 * 處理工具呼叫
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (name === "convertBrailleToText") {
      const parseResult = z.object({ braille: z.string() }).safeParse(args);
      if (!parseResult.success) {
        throw new Error("Invalid arguments: 'braille' string is required.");
      }

      const { braille } = parseResult.data;
      // 呼叫核心轉換邏輯
      const result = service.convertBrailleToText(braille);

      return {
        content: [{ type: "text", text: result }],
      };
    }

    if (name === "convertTextToBraille") {
      const parseResult = z.object({ text: z.string() }).safeParse(args);
      if (!parseResult.success) {
        throw new Error("Invalid arguments: 'text' string is required.");
      }

      const { text } = parseResult.data;
      // 呼叫核心轉換邏輯
      const result = service.convertTextToBraille(text);

      return {
        content: [{ type: "text", text: result }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

/**
 * 啟動 Server
 */
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("McBopomofo Braille MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
