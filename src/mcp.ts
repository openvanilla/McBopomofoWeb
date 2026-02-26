/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 * The main entrance of the IME for ChromeOS.
 */

/**
 * @file mcp.ts
 * @description Model Context Protocol (MCP) server implementation for
 * McBopomofo. This server provides tools for converting between Chinese text,
 * Bopomofo, Pinyin, and Taiwanese Braille.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { z } from "zod";
import { Service } from "./McBopomofo/Service";
import { BopomofoBrailleConverter } from "./BopomofoBraille";

/**
 * Initializes and runs the MCP server with registered tools for text
 * conversion. The server communicates via standard I/O using
 * StdioServerTransport.
 */
async function runServerTransport() {
  const service = new Service();

  // Create an MCP server instance with basic metadata.
  const server = new McpServer({
    name: "mcp-mcbopomofo",
    title: "McBopomofo",
    version: "1.9.6",
  });

  // Tool: Convert Taiwanese Braille to Chinese text.
  server.registerTool(
    "convertBrailleToText",
    {
      description:
        "將台灣點字字串直接轉換為國字 (Convert Taiwanese Braille to Chinese text). 支援中英數混打解析 (Supports mixed input including Taiwanese Braille, Roman letters, numbers and symbols)。當中可能包含中文錯字，LLM 可以按照需要，訂正當中的文字 (May contain Chinese misspelled characters, LLM can correct the characters as needed)",
      inputSchema: {
        braille: z
          .string()
          .describe("點字 Unicode 字串 (Braille Unicode String), 例如: ⠓⠩⠈⠅⠎⠐"),
      },
    },
    async ({ braille }) => {
      const result = service.convertBrailleToText(braille);
      return {
        content: [
          {
            type: "text",
            text: result,
            hint: "這是由一個注音輸入法引擎將點字轉換成國字的轉換結果，當中可能包含中文錯字，LLM 可以按照需要，訂正當中的文字。",
          },
        ],
      };
    }
  );

  // Tool: Convert Chinese text, numbers, or English letters to Taiwanese
  // Braille.
  server.registerTool(
    "convertTextToBraille",
    {
      description:
        "將國字、數字或英文字母轉換為台灣點字 (Convert Chinese text to Taiwanese Braille) ",
      inputSchema: {
        text: z.string().describe("中英文混合的字串，像是 'Hi 你好'"),
      },
    },
    async ({ text }) => {
      const result = service.convertTextToBraille(text);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    }
  );

  // Tool: Convert Bopomofo, numbers, or English letters to Taiwanese Braille.
  server.registerTool(
    "convertBpmfToBraille",
    {
      description:
        "將注音、數字或英文字母轉換為台灣點字 (Convert Bopomofo syllable to Taiwanese Braille). 如果 LLM 需要精確的點字轉換，LLM 可以先將國字轉換成注音，再用這個工具，將注音轉換成點字。 (If LLM needs precise braille conversion, LLM can first convert Chinese characters to pinyin, then use this tool to convert pinyin to braille)",
      inputSchema: {
        bpmf: z
          .string()
          .describe(
            "包含注音 、數字或英文的字串 (Text content), 例如: ㄗㄠˇㄐㄧㄡˋ"
          ),
      },
    },
    async (args: { bpmf: string }) => {
      const { bpmf } = args;
      const result = BopomofoBrailleConverter.convertBpmfToBraille(bpmf);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    }
  );

  // Tool: Convert Taiwanese Braille to Bopomofo.
  server.registerTool(
    "convertBrailleToBpmf",
    {
      description:
        "將台灣點字字串轉換為注音 (Convert Taiwanese Braille to Bopomofo syllable). 如果 LLM 需要精確的注音轉換，LLM 可以先用這個工具將點字轉換成注音，然後用 LLM 的能力，將注音轉換成國字 (If LLM needs precise braille conversion, LLM can first use this tool to convert braille to pinyin, then use LLM's ability to convert pinyin to Chinese characters)",
      inputSchema: {
        braille: z
          .string()
          .describe("點字 Unicode 字串 (Braille Unicode String), 例如: ⠓⠩⠈⠅⠎⠐"),
      },
    },
    async ({ braille }) => {
      const result = BopomofoBrailleConverter.convertBrailleToBpmf(braille);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    }
  );

  // Tool: Convert Chinese text to Bopomofo readings.
  server.registerTool(
    "convertTextToBpmfReadings",
    {
      description:
        "將國字轉換成注音 (Convert Chinese text to Bopomofo syllable).",
      inputSchema: {
        text: z
          .string()
          .describe("包含國字 、數字或英文的字串 (Text content), 例如: 你好"),
      },
    },
    async ({ text }) => {
      const result = service.convertTextToBpmfReadings(text);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    }
  );

  // Tool: Convert Chinese text to Hanyu Pinyin.
  server.registerTool(
    "convertTextToPinyin",
    {
      description:
        "將國字轉換成漢語拼音 (Convert Chinese text to Hanyu Pinyin).",
      inputSchema: {
        text: z
          .string()
          .describe("包含國字 、數字或英文的字串 (Text content), 例如: 你好"),
      },
    },
    async ({ text }) => {
      const result = service.convertTextToPinyin(text);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    }
  );

  // Connect to the transport.
  await server.connect(new StdioServerTransport());
}

/**
 * Entry point for the MCP server.
 */
async function run() {
  runServerTransport();
}

// Start the server and handle any fatal errors.
run().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
