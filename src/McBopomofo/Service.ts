import {
  BopomofoBrailleConverter,
  BopomofoSyllable as BrailleBopomofoSyllable,
} from "../BopomofoBraille";
import { ReadingGrid } from "../Gramambular2";
import { webData } from "./WebData";
import { WebLanguageModel } from "./WebLanguageModel";
import { BopomofoSyllable as MandarinBopomofoSyllable } from "../Mandarin";
import { read } from "fs";

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

  /**
   * Sets phrases to exclude from the language model suggestions.
   *
   * @param input The map of user phrases.
   */
  public setExcludedPhrases(input: Map<string, string[]> | string): void {
    this.lm_.setExcludedPhrases(input);
  }

  private convertText(
    input: string,
    readingCallback: (reading: string, value: string) => string,
    nonReadingCallback: (input: string) => string,
    addingSpaceBetweenChineseAndOtherTypes = false, // Braille needs additional space between Chinese characters, letters and digits.
    addingSpaceBetweenChinese = false
  ): string {
    let output: string = "";
    const converted = ChineseConvert.cn2tw(input);
    const length = converted.length;
    let readHead = 0;
    let pendingText = "";

    const isASCII = (input: string): boolean => {
      return /^[\x00-\x7F]*$/.test(input);
    };

    while (readHead < length) {
      const targetLength = Math.min(6, length - readHead);
      let found = false;
      for (let i = targetLength; i > 0; i--) {
        const end = readHead + i;
        const subString = converted.substring(readHead, end);
        const reading = this.lm_.getReading(subString);
        if (reading !== undefined) {
          if (reading.startsWith("_")) {
            // Punctuation
            if (
              addingSpaceBetweenChineseAndOtherTypes &&
              output.length > 0 &&
              pendingText.length === 0 &&
              isASCII(subString.charAt(0))
            ) {
              pendingText += " ";
            }
            pendingText += subString;
          } else {
            if (pendingText.length > 0) {
              output += nonReadingCallback(pendingText);
              if (
                addingSpaceBetweenChineseAndOtherTypes &&
                isASCII(pendingText.charAt(pendingText.length - 1))
              ) {
                output += " ";
              }
              pendingText = "";
            }

            const components = reading.split("-");

            if (addingSpaceBetweenChinese && readHead > 0) {
              output += " ";
            }

            if (components.length === subString.length) {
              const converted = [];
              for (let i = 0; i < components.length; i++) {
                const component = components[i];
                const char = subString.charAt(i);
                converted.push(readingCallback(component, char));
              }
              output += converted.join(addingSpaceBetweenChinese ? " " : "");
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
        const subString = converted.charAt(readHead);
        if (
          addingSpaceBetweenChineseAndOtherTypes &&
          output.length > 0 &&
          pendingText.length === 0 &&
          isASCII(subString)
        ) {
          pendingText += " ";
        }

        pendingText += subString;
        readHead += 1;
      }
    }

    if (pendingText.length > 0) {
      if (
        addingSpaceBetweenChineseAndOtherTypes &&
        output.length > 0 &&
        pendingText.length === 0 &&
        isASCII(pendingText)
      ) {
        pendingText += " ";
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
   * ``` typescript
   * let service = new Service();
   * let input = "⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄⠊⠌⠄⠛⠌⠐⠟⠜⠈";
   * let output = service.convertTextToBraille(input);
   * ```
   */
  public convertBrailleToText(input: string): string {
    let output: string = "";
    const tokens = BopomofoBrailleConverter.convertBrailleToTokens(input);
    // console.log(tokens);
    for (const token of tokens) {
      if (token instanceof BrailleBopomofoSyllable) {
        this.grid_.insertReading(token.bpmf);
      } else {
        const result = this.grid_.walk();
        for (const node of result.nodes) {
          output += node.value;
        }
        this.grid_.clear();
        output += token;
      }
    }

    const result = this.grid_.walk();
    for (const node of result.nodes) {
      output += node.value;
    }
    this.grid_.clear();
    return output;
  }

  /**
   * Converts text to Taiwanese Braille
   * @param input The text input
   * @returns The Braille output
   * ``` typescript
   * let service = new Service();
   * let input = "小麥注音輸入法";
   * let output = service.convertTextToBraille(input);
   * ```
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
   * @example
   * ``` typescript
   * let service = new Service();
   * let input = "小麥注音輸入法";
   * let output = service.convertTextToHtmlRuby(input);
   * ```
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
   * @example
   * ``` typescript
   * let service = new Service();
   * let input = "小麥注音輸入法";
   * let output = service.convertTextToBpmfReadings(input);
   * ```
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

  public convertTextToRawReadings(input: string): string {
    let output = this.convertText(
      input,
      (reading: string, value: string) => {
        return reading + "-";
      },
      (input: string) => {
        return input;
      }
    );
    if (output.endsWith("-")) {
      output = output.substring(0, output.length - 1);
    }
    return output;
  }

  /**
   * Appends Bopomofo readings to the input text.
   * @param input The input text.
   * @returns The text with Bopomofo readings appended.
   * @example
   * ``` typescript
   * let service = new Service();
   * let input = "小麥注音輸入法";
   * let output = service.appendBpmfReadingsToText(input);
   * ```
   */
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

  /**
   * Converts Chinese text to Hanyu Pinyin representation.
   *
   * This method takes Chinese text as input and returns its romanized form in
   * Hanyu Pinyin. The conversion processes each character individually,
   * converting Bopomofo readings to Pinyin syllables.
   *
   * @param input - The Chinese text string to be converted to Pinyin
   * @returns A string containing the Hanyu Pinyin representation of the input
   *          text, with syllables separated by spaces
   *
   * @example
   * ``` typescript
   * const service = new Service();
   * const pinyin = service.convertTextToPinyin("中文");
   * // Returns: "zhong wen"
   * ```
   */
  public convertTextToPinyin(input: string): string {
    return this.convertText(
      input,
      (reading: string, _: string) => {
        const pinyinComponents = [];
        const components = reading.split("-");
        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          const syllable = MandarinBopomofoSyllable.FromComposedString(component);
          const pinyin = syllable.HanyuPinyinString(false, false);
          pinyinComponents.push(pinyin);
        }
        return pinyinComponents.join(" ");
      },
      (input: string) => {
        return input;
      },
      true,
      true
    );
  }
}
