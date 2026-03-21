import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { BopomofoBrailleConverter, BrailleType } from "./BopomofoBraille";
import { Service } from "./McBopomofo/Service";

const brailleFormatSchema = z
  .enum(["unicode", "ascii"])
  .default("unicode")
  .describe(
    "點字格式，支援 unicode 或 ascii (Braille format: unicode or ascii)"
  );

type BrailleFormat = z.infer<typeof brailleFormatSchema>;

const toBrailleType = (format: BrailleFormat): BrailleType =>
  format === "ascii" ? BrailleType.ASCII : BrailleType.UNICODE;

export const convertBrailleToTextWithFormat = (
  service: Service,
  braille: string,
  format: BrailleFormat = "unicode"
): string =>
  format === "ascii"
    ? service.convertAsciiBrailleToText(braille)
    : service.convertBrailleToText(braille);

export const convertTextToBrailleWithFormat = (
  service: Service,
  text: string,
  format: BrailleFormat = "unicode"
): string =>
  format === "ascii"
    ? service.convertTextToAsciiBraille(text)
    : service.convertTextToBraille(text);

export const convertBpmfToBrailleWithFormat = (
  bpmf: string,
  format: BrailleFormat = "unicode"
): string =>
  BopomofoBrailleConverter.convertBpmfToBraille(bpmf, toBrailleType(format));

export const convertBrailleToBpmfWithFormat = (
  braille: string,
  format: BrailleFormat = "unicode"
): string =>
  BopomofoBrailleConverter.convertBrailleToBpmf(braille, toBrailleType(format));

export const convertTextToBpmfReadingsForMcp = (
  service: Service,
  text: string
): string => service.convertTextToBpmfReadings(text);

export const convertTextToPinyinForMcp = (
  service: Service,
  text: string
): string => service.convertTextToPinyin(text);

export const convertTextToBpmfAnnotatedTextForMcp = (
  service: Service,
  text: string
): string => service.convertTextToBpmfAnnotatedText(text);

export const annotateSingleCharacterForMcp = (
  service: Service,
  text: string,
  reading: string
): string => service.annotateSingleCharacter(text, reading);

async function runServerTransport() {
  const service = new Service();

  const server = new McpServer({
    name: "mcp-mcbopomofo",
    title: "McBopomofo",
    version: "2.0.1",
  });

  server.registerTool(
    "convertBrailleToText",
    {
      description:
        "將台灣點字字串直接轉換為國字 (Convert Taiwanese Braille to Chinese text). 支援中英數混打解析 (Supports mixed input including Taiwanese Braille, Roman letters, numbers and symbols)。當中可能包含中文錯字，LLM 可以按照需要，訂正當中的文字 (May contain Chinese misspelled characters, LLM can correct the characters as needed)",
      inputSchema: {
        braille: z
          .string()
          .describe("點字 Unicode 字串 (Braille Unicode String), 例如: ⠓⠩⠈⠅⠎⠐"),
        format: brailleFormatSchema,
      },
    },
    async ({ braille, format }) => {
      const result = convertBrailleToTextWithFormat(service, braille, format);
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
  server.registerTool(
    "convertTextToBraille",
    {
      description:
        "將國字、數字或英文字母轉換為台灣點字 (Convert Chinese text to Taiwanese Braille) 。請注意，這個工具會先將國字轉換成注音，再用這個工具，將注音轉換成點字，轉換過程不見得精確，如果 LLM 自己有更好的轉換能力，可以考慮使用 LLM 的能力，然後呼叫 convertBpmfToBraille 工具。 (If LLM needs precise braille conversion, LLM can first convert Chinese characters to bopomofo, then use this tool to convert bopomofo to braille)",
      inputSchema: {
        text: z.string().describe("中英文混合的字串，像是 'Hi 你好'"),
        format: brailleFormatSchema,
      },
    },
    async ({ text, format }) => {
      const result = convertTextToBrailleWithFormat(service, text, format);
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
        format: brailleFormatSchema,
      },
    },
    async (args: { bpmf: string; format: BrailleFormat }) => {
      const { bpmf, format } = args;
      const result = convertBpmfToBrailleWithFormat(bpmf, format);
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
  server.registerTool(
    "convertBrailleToBpmf",
    {
      description:
        "將台灣點字字串轉換為注音 (Convert Taiwanese Braille to Bopomofo syllable). 如果 LLM 需要精確的注音轉換，LLM 可以先用這個工具將點字轉換成注音，然後用 LLM 的能力，將注音轉換成國字 (If LLM needs precise braille conversion, LLM can first use this tool to convert braille to pinyin, then use LLM's ability to convert pinyin to Chinese characters)",
      inputSchema: {
        braille: z
          .string()
          .describe("點字 Unicode 字串 (Braille Unicode String), 例如: ⠓⠩⠈⠅⠎⠐"),
        format: brailleFormatSchema,
      },
    },
    async ({ braille, format }) => {
      const result = convertBrailleToBpmfWithFormat(braille, format);
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
  server.registerTool(
    "convertTextToBpmfReadings",
    {
      description:
        "將國字轉換成注音 (Convert Chinese text to Bopomofo syllable)。請注意，這個工具將國字轉換成注音的流程，是使用小麥詞庫加上簡單的分析，因此可能有錯字，如果 LLM 自己有更好的轉換能力，可以考慮使用 LLM 的能力。(Please note that this tool converts Chinese characters to Bopomofo using the McBopomofo dictionary together with a simple analysis process. As a result, conversion errors may occur. If the LLM itself has a better conversion capability, it may consider using its own ability instead.)",
      inputSchema: {
        text: z
          .string()
          .describe("包含國字 、數字或英文的字串 (Text content), 例如: 你好"),
      },
    },
    async ({ text }) => {
      const result = convertTextToBpmfReadingsForMcp(service, text);
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
      const result = convertTextToPinyinForMcp(service, text);
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
  server.registerTool(
    "convertTextToBpmfAnnotatedText",
    {
      description:
        "將國字轉換成支援注音字體的文字 (Convert Chinese text to Bopomofo annotated text)。請注意，這個工具將國字轉換成注音的流程，是使用小麥詞庫加上簡單的分析，因此可能有錯字。(Please note that this tool converts Chinese characters to Bopomofo using the McBopomofo dictionary together with a simple analysis process. As a result, conversion errors may occur.) 這個功能需要額外字體支援，可以提是用戶，如果要產生 HTML 結果，要先在 HTML 中加上一個 CSS stylesheet https://oikasu1.github.io/fonts/twfonts.css ，然後套用 BpmfZihiSerif-Regular、BpmfZihiSans-Regular 或 BpmfZihiKaiStd-Regular 等字體 (If you want to generate HTML results, you can first add a CSS stylesheet https://oikasu1.github.io/fonts/twfonts.css and then apply the fonts like BpmfZihiSerif-Regular, BpmfZihiSans-Regular, or BpmfZihiKaiStd-Regular.)",
      inputSchema: {
        text: z
          .string()
          .describe("包含國字 、數字或英文的字串 (Text content), 例如: 你好"),
      },
      annotations: {},
    },
    async ({ text }) => {
      const result = convertTextToBpmfAnnotatedTextForMcp(service, text);
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
  server.registerTool(
    "annotateSingleCharacter",
    {
      description:
        "將單一國字注音，轉換成標記字體的字串 (Convert a single Chinese character to a string with annotations)。如果 LLM 知道一個字的注音，就可以使用這個工具，將注音轉換成標記字體的字串。(If LLM knows a character's reading, it can use this tool to convert the reading to a string with annotations)。這個功能需要額外字體支援，可以提是用戶，如果要產生 HTML 結果，要先在 HTML 中加上一個 CSS stylesheet https://oikasu1.github.io/fonts/twfonts.css ，然後套用 BpmfZihiSerif-Regular、BpmfZihiSans-Regular 或 BpmfZihiKaiStd-Regular 等字體 (If you want to generate HTML results, you can first add a CSS stylesheet https://oikasu1.github.io/fonts/twfonts.css and then apply the fonts like BpmfZihiSerif-Regular, BpmfZihiSans-Regular, or BpmfZihiKaiStd-Regular.)",
      inputSchema: {
        text: z.string().describe("國字, 例如: 你"),
        reading: z.string().describe("注音, 例如: ㄋㄧˇ"),
      },
      annotations: {},
    },
    async ({ text, reading }) => {
      const result = annotateSingleCharacterForMcp(service, text, reading);
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

  await server.connect(new StdioServerTransport());
}

async function run() {
  await runServerTransport();
}

if (require.main === module) {
  run().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
  });
}
