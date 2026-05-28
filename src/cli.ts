#!/usr/bin/env node
import { BopomofoBrailleConverter, BrailleType } from "./BopomofoBraille";
import { Service } from "./McBopomofo/Service";

const service = new Service();

function printUsage() {
  console.log("Usage: mcbopomofo <command> [input] [--format=unicode|ascii]");
  console.log("");
  console.log("Commands:");
  console.log("  text-to-braille <text>        Convert Chinese text to Braille");
  console.log("  braille-to-text <braille>     Convert Braille to Chinese text");
  console.log("  text-to-pinyin <text>         Convert Chinese text to Hanyu Pinyin");
  console.log("  text-to-bpmf <text>           Convert Chinese text to Bopomofo readings");
  console.log("  text-to-bpmf-spaced <text>    Convert Chinese text to Bopomofo readings with spaces");
  console.log("  bpmf-to-text <bpmf>           Convert Bopomofo syllables to Chinese text");
  console.log("  bpmf-to-braille <bpmf>        Convert Bopomofo syllables to Braille");
  console.log("  braille-to-bpmf <braille>     Convert Braille to Bopomofo syllables");
  console.log("  text-to-annotated <text>      Convert Chinese text to Bopomofo annotated text");
  console.log("");
  console.log("Options:");
  console.log("  --format=unicode              Use Unicode Braille (default)");
  console.log("  --format=ascii                Use ASCII Braille");
}

async function getStdin(): Promise<string> {
  let result = "";
  if (process.stdin.isTTY) return "";
  for await (const chunk of process.stdin) {
    result += chunk;
  }
  return result.trim();
}

export async function main(args: string[], stdinInput?: string): Promise<string> {
  let command = "";
  let input = "";
  let format: BrailleType = BrailleType.UNICODE;

  for (const arg of args) {
    if (arg.startsWith("--format=")) {
      const f = arg.split("=")[1];
      if (f === "ascii") {
        format = BrailleType.ASCII;
      } else {
        format = BrailleType.UNICODE;
      }
    } else if (!command) {
      command = arg;
    } else if (!input) {
      input = arg;
    }
  }

  if (!command) {
    printUsage();
    return "";
  }

  if (!input) {
    if (stdinInput !== undefined) {
      input = stdinInput;
    } else {
      input = await getStdin();
    }
  }

  if (!input) {
    throw new Error("No input provided.");
  }

  let result = "";
  switch (command) {
    case "text-to-braille":
      result =
        format === BrailleType.ASCII
          ? service.convertTextToAsciiBraille(input)
          : service.convertTextToBraille(input);
      break;
    case "braille-to-text":
      result =
        format === BrailleType.ASCII
          ? service.convertAsciiBrailleToText(input)
          : service.convertBrailleToText(input);
      break;
    case "text-to-pinyin":
      result = service.convertTextToPinyin(input);
      break;
    case "text-to-bpmf":
      result = service.convertTextToBpmfReadings(input);
      break;
    case "text-to-bpmf-spaced":
      result = service.convertTextToBpmfReadingsWithSpaces(input);
      break;
    case "bpmf-to-text":
      result = service.convertBpmfToText(input);
      break;
    case "bpmf-to-braille":
      result = BopomofoBrailleConverter.convertBpmfToBraille(input, format);
      break;
    case "braille-to-bpmf":
      result = BopomofoBrailleConverter.convertBrailleToBpmf(input, format);
      break;
    case "text-to-annotated":
      result = service.convertTextToBpmfAnnotatedText(input);
      break;
    default:
      throw new Error(`Unknown command "${command}"`);
  }

  return result;
}

if (require.main === module) {
  main(process.argv.slice(2))
    .then((result) => {
      if (result) console.log(result);
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
