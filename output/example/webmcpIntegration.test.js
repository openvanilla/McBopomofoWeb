const {
  buildMcbopomofoWebMcpTools,
  initMcbopomofoWebMcp,
} = require("./webmcpIntegration.js");
const fs = require("fs");
const path = require("path");

const createService = () => ({
  convertAsciiBrailleToText: jest.fn((text) => `ascii text:${text}`),
  convertBrailleToText: jest.fn((text) => `unicode text:${text}`),
  convertTextToAsciiBraille: jest.fn((text) => `ascii braille:${text}`),
  convertTextToBraille: jest.fn((text) => `unicode braille:${text}`),
  convertTextToBpmfReadings: jest.fn((text) => `bpmf:${text}`),
  convertTextToPinyin: jest.fn((text) => `pinyin:${text}`),
  convertTextToBpmfAnnotatedText: jest.fn((text) => `annotated:${text}`),
  annotateSingleCharacter: jest.fn((text, reading) => `${text}:${reading}`),
});

describe("buildMcbopomofoWebMcpTools", () => {
  it("exposes conversion tools with MCP text content results", async () => {
    const service = createService();
    const tools = buildMcbopomofoWebMcpTools(service);

    const textToBraille = tools.find(
      (tool) => tool.name === "convertTextToBraille",
    );
    const brailleToText = tools.find(
      (tool) => tool.name === "convertBrailleToText",
    );
    const annotateSingleCharacter = tools.find(
      (tool) => tool.name === "annotateSingleCharacter",
    );

    await expect(
      textToBraille.handler({ text: "小麥", format: "ascii" }),
    ).resolves.toEqual({
      content: [{ type: "text", text: "ascii braille:小麥" }],
    });
    await expect(
      brailleToText.handler({ braille: "⠑⠪", format: "unicode" }),
    ).resolves.toEqual({
      content: [{ type: "text", text: "unicode text:⠑⠪" }],
    });
    await expect(
      annotateSingleCharacter.handler({ text: "你", reading: "ㄋㄧˇ" }),
    ).resolves.toEqual({
      content: [{ type: "text", text: "你:ㄋㄧˇ" }],
    });
  });

  it("defaults unknown braille formats to unicode", async () => {
    const service = createService();
    const tools = buildMcbopomofoWebMcpTools(service);
    const tool = tools.find((item) => item.name === "convertTextToBraille");

    await tool.handler({ text: "小麥", format: "bad" });

    expect(service.convertTextToBraille).toHaveBeenCalledWith("小麥");
    expect(service.convertTextToAsciiBraille).not.toHaveBeenCalled();
  });
});

describe("initMcbopomofoWebMcp", () => {
  it("registers tools with the browser modelContext API when present", () => {
    const service = createService();
    const registerTool = jest.fn();
    const globalScope = {
      navigator: {
        modelContext: {
          registerTool,
        },
      },
    };

    const result = initMcbopomofoWebMcp(globalScope, service);

    expect(result.nativeRegistered).toBe(true);
    expect(registerTool).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "convertTextToBraille",
        inputSchema: expect.objectContaining({
          type: "object",
          properties: expect.any(Object),
        }),
        execute: expect.any(Function),
      }),
    );
  });

  it("registers tools with the WebMCP bridge widget when present", () => {
    const service = createService();
    const registerTool = jest.fn();
    const WebMCP = jest.fn(() => ({ registerTool }));
    const globalScope = { WebMCP };

    const result = initMcbopomofoWebMcp(globalScope, service);

    expect(result.bridgeRegistered).toBe(true);
    expect(WebMCP).toHaveBeenCalled();
    expect(registerTool).toHaveBeenCalledWith(
      "convertTextToBraille",
      expect.any(String),
      expect.objectContaining({
        text: expect.any(Object),
      }),
      expect.any(Function),
    );
  });
});

describe("example WebMCP script loading", () => {
  it("loads the local widget script instead of the documentation-only URL", () => {
    const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

    expect(html).toContain('src="webmcp.js"');
    expect(html).not.toContain("https://webmcp.dev/webmcp.js");
  });
});
