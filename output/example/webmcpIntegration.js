(function (globalScope) {
  const textContent = (text) => ({
    content: [
      {
        type: "text",
        text,
      },
    ],
  });

  const normalizeFormat = (format) => (format === "ascii" ? "ascii" : "unicode");

  const textInputSchema = {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "包含國字、數字或英文的字串 (Text content), 例如: 你好",
      },
    },
    required: ["text"],
  };

  const brailleFormatSchema = {
    type: "string",
    enum: ["unicode", "ascii"],
    default: "unicode",
    description: "點字格式，支援 unicode 或 ascii (Braille format)",
  };

  const buildMcbopomofoWebMcpTools = (service) => [
    {
      name: "convertBrailleToText",
      description:
        "將台灣點字字串直接轉換為國字 (Convert Taiwanese Braille to Chinese text).",
      inputSchema: {
        type: "object",
        properties: {
          braille: {
            type: "string",
            description: "點字字串 (Braille String), 例如: ⠓⠩⠈⠅⠎⠐",
          },
          format: brailleFormatSchema,
        },
        required: ["braille"],
      },
      handler: async ({ braille, format = "unicode" }) =>
        textContent(
          normalizeFormat(format) === "ascii"
            ? service.convertAsciiBrailleToText(braille)
            : service.convertBrailleToText(braille),
        ),
    },
    {
      name: "convertTextToBraille",
      description:
        "將國字、數字或英文字母轉換為台灣點字 (Convert Chinese text to Taiwanese Braille).",
      inputSchema: {
        type: "object",
        properties: {
          ...textInputSchema.properties,
          format: brailleFormatSchema,
        },
        required: ["text"],
      },
      handler: async ({ text, format = "unicode" }) =>
        textContent(
          normalizeFormat(format) === "ascii"
            ? service.convertTextToAsciiBraille(text)
            : service.convertTextToBraille(text),
        ),
    },
    {
      name: "convertTextToBpmfReadings",
      description:
        "將國字轉換成注音 (Convert Chinese text to Bopomofo syllables).",
      inputSchema: textInputSchema,
      handler: async ({ text }) =>
        textContent(service.convertTextToBpmfReadings(text)),
    },
    {
      name: "convertTextToPinyin",
      description: "將國字轉換成漢語拼音 (Convert Chinese text to Hanyu Pinyin).",
      inputSchema: textInputSchema,
      handler: async ({ text }) => textContent(service.convertTextToPinyin(text)),
    },
    {
      name: "convertTextToBpmfAnnotatedText",
      description:
        "將國字轉換成支援注音字體的文字 (Convert Chinese text to Bopomofo annotated text).",
      inputSchema: textInputSchema,
      handler: async ({ text }) =>
        textContent(service.convertTextToBpmfAnnotatedText(text)),
    },
    {
      name: "annotateSingleCharacter",
      description:
        "將單一國字注音轉換成標記字體的字串 (Convert a single Chinese character and reading to annotated text).",
      inputSchema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "國字, 例如: 你",
          },
          reading: {
            type: "string",
            description: "注音, 例如: ㄋㄧˇ",
          },
        },
        required: ["text", "reading"],
      },
      handler: async ({ text, reading }) =>
        textContent(service.annotateSingleCharacter(text, reading)),
    },
  ];

  const registerNativeWebMcp = (globalScope, tools) => {
    const modelContext =
      globalScope.navigator && globalScope.navigator.modelContext;
    if (!modelContext || typeof modelContext.registerTool !== "function") {
      return false;
    }

    tools.forEach((tool) => {
      modelContext.registerTool({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        execute: tool.handler,
      });
    });
    return true;
  };

  const registerBridgeWebMcp = (globalScope, tools) => {
    if (typeof globalScope.WebMCP !== "function") {
      return false;
    }

    const mcp =
      globalScope.mcbopomofoWebMcp ||
      new globalScope.WebMCP({
        color: "#0f766e",
        position: "bottom-right",
      });
    tools.forEach((tool) => {
      mcp.registerTool(
        tool.name,
        tool.description,
        tool.inputSchema.properties,
        tool.handler,
      );
    });
    globalScope.mcbopomofoWebMcp = mcp;
    return true;
  };

  const initMcbopomofoWebMcp = (globalScope, service) => {
    const tools = buildMcbopomofoWebMcpTools(service);
    return {
      nativeRegistered: registerNativeWebMcp(globalScope, tools),
      bridgeRegistered: registerBridgeWebMcp(globalScope, tools),
      toolCount: tools.length,
    };
  };

  const initFromExample = () => {
    if (!globalScope.example || !globalScope.example.service) {
      return;
    }
    globalScope.example.webmcp = initMcbopomofoWebMcp(
      globalScope,
      globalScope.example.service.service,
    );
  };

  globalScope.buildMcbopomofoWebMcpTools = buildMcbopomofoWebMcpTools;
  globalScope.initMcbopomofoWebMcp = initMcbopomofoWebMcp;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      buildMcbopomofoWebMcpTools,
      initMcbopomofoWebMcp,
    };
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initFromExample);
    } else {
      initFromExample();
    }
  }
})(typeof window !== "undefined" ? window : globalThis);
