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
import express from "express";
import bodyParser from "body-parser";
import { BopomofoBrailleConverter } from "./BopomofoBraille";

const service = new Service();

const tools = [
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
  {
    name: "convertBpmfToBraille",
    description:
      "將注音、數字或英文字母轉換為台灣點字 (Convert Bopomofo syllable to Taiwanese Braille).",
    inputSchema: {
      type: "object",
      properties: {
        bpmf: {
          type: "string",
          description:
            "包含注音 、數字或英文的字串 (Text content), 例如: ㄗㄠˇㄐㄧㄡˋ",
        },
      },
      required: ["bpmf"],
    },
  },
  {
    name: "convertBrailleToBpmf",
    description:
      "將台灣點字字串轉換為注音 (Convert Taiwanese Braille to Bopomofo syllable).",
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
];

async function runServerTransport() {
  const server = new Server(
    {
      name: "mcp-mcbopomofo",
      version: "1.9.1",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: tools };
  });
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;

      function safeParse(schema: z.ZodType<any>, args: any) {
        const parseResult = schema.safeParse(args);
        if (!parseResult.success) {
          throw new Error("Invalid arguments: 'braille' string is required.");
        }
        return parseResult.data;
      }

      if (name === "convertBrailleToText") {
        const { braille } = safeParse(z.object({ braille: z.string() }), args);
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

      if (name === "convertTextToBraille") {
        const { text } = safeParse(z.object({ text: z.string() }), args);
        const result = service.convertTextToBraille(text);
        return {
          content: [{ type: "text", text: result }],
        };
      }
      if (name === "convertBpmfToBraille") {
        const { bpmf } = safeParse(z.object({ bpmf: z.string() }), args);
        const result = BopomofoBrailleConverter.convertBpmfToBraille(bpmf);
        return {
          content: [{ type: "text", text: result }],
        };
      }
      if (name === "convertBrailleToBpmf") {
        const { braille } = safeParse(z.object({ braille: z.string() }), args);
        const result = BopomofoBrailleConverter.convertBrailleToBpmf(braille);
        return {
          content: [{ type: "text", text: result }],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // console.log("McBopomofo Braille MCP Server running on stdio");
}

async function runHttpServer() {
  // Start HTTP Server
  const app = express();
  app.use(bodyParser.json());
  const PORT = process.env.PORT || 3000;

  app.post("/convertBrailleToText", (req, res) => {
    try {
      const { braille } = req.body;
      if (typeof braille !== "string") {
        return res
          .status(400)
          .json({ error: "Invalid request: 'braille' string is required." });
      }

      const result = service.convertBrailleToText(braille);
      res.json({
        type: "text",
        text: result,
        hint: "這是由一個注音輸入法引擎將點字轉換成國字的轉換結果，當中可能包含中文錯字，LLM 可以按照需要，訂正當中的文字。",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/convertTextToBraille", (req, res) => {
    try {
      const { text } = req.body;
      if (typeof text !== "string") {
        return res
          .status(400)
          .json({ error: "Invalid request: 'text' string is required." });
      }
      const result = service.convertTextToBraille(text);
      res.json({ type: "text", text: result });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/convertBpmfToBraille", (req, res) => {
    try {
      const { bpmf } = req.body;
      if (typeof bpmf !== "string") {
        return res
          .status(400)
          .json({ error: "Invalid request: 'bpmf' string is required." });
      }
      const result = BopomofoBrailleConverter.convertBpmfToBraille(bpmf);
      res.json({ type: "text", text: result });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/convertBrailleToBpmf", (req, res) => {
    try {
      const { braille } = req.body;
      if (typeof braille !== "string") {
        return res
          .status(400)
          .json({ error: "Invalid request: 'braille' string is required." });
      }
      const result = BopomofoBrailleConverter.convertBrailleToBpmf(braille);
      res.json({ type: "text", text: result });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/tools", (req, res) => {
    res.json({ tools });
  });

  app.listen(PORT, () => {
    // console.error(
    //   `McBopomofo Braille MCP Server (HTTP) running on port ${PORT}`
    // );
  });
}

async function run() {
  runHttpServer();
  runServerTransport();
}

run().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
