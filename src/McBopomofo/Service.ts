import { BopomofoBrailleConverter, BopomofoSyllable } from "../BopomofoBraille";
import { ReadingGrid } from "../Gramambular2";
import { webData } from "./WebData";
import { WebLanguageModel } from "./WebLanguageModel";

const ChineseConvert = require("chinese_convert");

/**
 * The text conversion service.
 *
 * The service provides the following functions:
 *  - Convert Taiwanese Braille to text
 *  - Convert text to Bopomofo readings
 *  - Convert text to HTML Ruby
 *  - Convert text to Taiwanese Braille
 */
export class Service {
  private lm_: WebLanguageModel;
  private grid_: ReadingGrid;

  constructor() {
    this.lm_ = new WebLanguageModel(webData);
    this.grid_ = new ReadingGrid(this.lm_);
  }

  /**
   * Sets the user phrases to the language model.
   * @param input The map of user phrases.
   */
  public setUserPhrases(input: Map<string, string[]> | string): void {
    this.lm_.setUserPhrases(input);
  }

  private convertText(
    input: string,
    readingCallback: (reading: string, value: string) => string,
    nonReadingCallback: (input: string) => string,
    addingSpace = false // Braille needs additional space between Chinese characters, letters and digits.
  ): string {
    let output: string = "";
    let converted = ChineseConvert.cn2tw(input);
    let length = converted.length;
    let readHead = 0;
    let pendingText = "";

    let isASCII = (input: string): boolean => {
      return /^[\x00-\x7F]*$/.test(input);
    };

    while (readHead < length) {
      let targetLength = Math.min(6, length - readHead);
      let found = false;
      for (let i = targetLength; i > 0; i--) {
        let end = readHead + i;
        let subString = converted.substring(readHead, end);
        let reading = this.lm_.getReading(subString);
        if (reading !== undefined) {
          if (reading.startsWith("_")) {
            if (
              addingSpace &&
              output.length > 0 &&
              pendingText.length == 0 &&
              isASCII(subString.charAt(0))
            ) {
              console.log("add 1");
              pendingText += " ";
            }
            pendingText += subString;
          } else {
            if (pendingText.length > 0) {
              output += nonReadingCallback(pendingText);
              if (
                addingSpace &&
                isASCII(pendingText.charAt(pendingText.length - 1))
              ) {
                output += " ";
                console.log("add 2");
              }
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
        let subString = converted.charAt(readHead);
        if (
          addingSpace &&
          output.length > 0 &&
          pendingText.length == 0 &&
          isASCII(subString)
        ) {
          pendingText += " ";
          console.log("add 3");
        }

        pendingText += subString;
        readHead += 1;
      }
    }

    if (pendingText.length > 0) {
      if (
        addingSpace &&
        output.length > 0 &&
        pendingText.length == 0 &&
        isASCII(pendingText)
      ) {
        pendingText += " ";
        console.log("add 4");
      }

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
    console.log(tokens);
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
      },
      true
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
