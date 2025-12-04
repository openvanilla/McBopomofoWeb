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
];

async function runServerTransport() {
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

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: tools };
  });
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;

      if (name === "convertBrailleToText") {
        const parseResult = z.object({ braille: z.string() }).safeParse(args);
        if (!parseResult.success) {
          throw new Error("Invalid arguments: 'braille' string is required.");
        }

        const { braille } = parseResult.data;
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
        const result = service.convertTextToBraille(text);
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
  console.log("McBopomofo Braille MCP Server running on stdio");
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
      res.json({ result });
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
      res.json({ result });
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
    console.error(
      `McBopomofo Braille MCP Server (HTTP) running on port ${PORT}`
    );
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
