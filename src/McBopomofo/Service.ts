import { BopomofoBrailleConverter, BopomofoSyllable } from "../BopomofoBraille";
import { ReadingGrid } from "../Gramambular2";
import { webData } from "./WebData";
import { WebLanguageModel } from "./WebLanguageModel";

const ChineseConvert = require("chinese_convert");

export class Service {
  private lm_: WebLanguageModel;
  private grid_: ReadingGrid;

  constructor() {
    this.lm_ = new WebLanguageModel(webData);
    this.grid_ = new ReadingGrid(this.lm_);
  }

  private convertText(
    input: string,
    readingCallback: (reading: string, value: string) => string,
    nonReadingCallback: (input: string) => string
  ): string {
    let output: string = "";
    let converted = ChineseConvert.cn2tw(input);
    let length = converted.length;
    let readHead = 0;
    let pendingText = "";

    while (readHead < length) {
      let targetLength = Math.min(6, length - readHead);
      let found = false;
      for (let i = targetLength; i > 0; i--) {
        let end = readHead + i;
        let subString = converted.substring(readHead, end);
        let reading = this.lm_.getReading(subString);
        if (reading != undefined) {
          if (reading.startsWith("_")) {
            pendingText += subString;
          } else {
            if (pendingText.length > 0) {
              output += nonReadingCallback(pendingText);
              pendingText = "";
            }

            let components = reading.split("-");

            if (components.length == subString.length) {
              for (let i = 0; i < components.length; i++) {
                let component = components[i];
                let char = subString.charAt(i);
                output += readingCallback(component, char);
              }
            } else {
              output += readingCallback(components.join(" "), subString);
            }
          }
          readHead = end;
          found = true;
          break;
        }
      }

      if (!found) {
        pendingText += converted.charAt(readHead);
        readHead += 1;
      }
    }

    if (pendingText.length > 0) {
      output += nonReadingCallback(pendingText);
      pendingText = "";
    }

    return output;
  }

  /**
   * Convert Taiwanese Braille to text
   * @param input The Braille input
   * @returns The text output
   */
  public convertBrailleToText(input: string): string {
    let output: string = "";
    let tokens = BopomofoBrailleConverter.convertBrailleToTokens(input);
    for (let token of tokens) {
      if (token instanceof BopomofoSyllable) {
        this.grid_.insertReading(token.bpmf);
      } else {
        let result = this.grid_.walk();
        for (let node of result.nodes) {
          output += node.value;
        }
        this.grid_.clear();
        output += token;
      }
    }

    let result = this.grid_.walk();
    for (let node of result.nodes) {
      output += node.value;
    }
    this.grid_.clear();
    return output;
  }

  /**
   * Converts text to Taiwanese Braille
   * @param input The text input
   * @returns The Braille output
   */
  public convertTextToBraille(input: string): string {
    return this.convertText(
      input,
      (reading: string, _: string) => {
        return BopomofoBrailleConverter.convertBpmfToBraille(reading);
      },
      (input: string) => {
        return BopomofoBrailleConverter.convertBpmfToBraille(input);
      }
    );
  }

  /**
   * Converts text to HTML Ruby
   * @param input The text input
   * @returns The HTML Ruby output
   */
  public convertTextToHtmlRuby(input: string): string {
    return this.convertText(
      input,
      (reading: string, value: string) => {
        let composed = "<ruby>";
        composed += value;
        composed += "<rp>(</rp><rt>" + reading + "</rt><rp>)</rp>";
        composed += "</ruby>";
        return composed;
      },
      (input: string) => {
        return input;
      }
    );
  }

  /**
   * Converts text to Bopomofo readings.
   * @param input The text input
   * @returns The Bopomofo output
   */
  public convertTextToBpmfReadings(input: string): string {
    return this.convertText(
      input,
      (reading: string, value: string) => {
        return reading;
      },
      (input: string) => {
        return input;
      }
    );
  }

  public appendBpmfReadingsToText(input: string): string {
    return this.convertText(
      input,
      (reading: string, value: string) => {
        return value + "(" + reading + ")";
      },
      (input: string) => {
        return input;
      }
    );
  }
}
