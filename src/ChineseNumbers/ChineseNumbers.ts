/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import {
  TrimZerosAtStart,
  TrimZerosAtEnd as TrimZerosAtEnd,
} from "./StringUtils";

/**
 * Controls the glyph set used when rendering Chinese numerals.
 *
 * The lowercase variant uses everyday characters such as `一` and `二`, while
 * the uppercase variant produces financial forms like `壹` and `貳`.
 */
export enum Case {
  /** Use the common form `一二三四五…`. */
  lowercase,
  /** Use the financial form `壹貳參肆伍…`. */
  uppercase,
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
/* istanbul ignore next */
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
    padString = String(typeof padString !== "undefined" ? padString : " ");
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this);
    }
  };
}

function digits(numberCase: Case) {
  switch (numberCase) {
    case Case.lowercase:
      return new Map<string, string>([
        ["0", "〇"],
        ["1", "一"],
        ["2", "二"],
        ["3", "三"],
        ["4", "四"],
        ["5", "五"],
        ["6", "六"],
        ["7", "七"],
        ["8", "八"],
        ["9", "九"],
      ]);
    case Case.uppercase:
      return new Map<string, string>([
        ["0", "零"],
        ["1", "壹"],
        ["2", "貳"],
        ["3", "參"],
        ["4", "肆"],
        ["5", "伍"],
        ["6", "陸"],
        ["7", "柒"],
        ["8", "捌"],
        ["9", "玖"],
      ]);
    default:
      throw new Error("Invalid case");
  }
}

function places(numberCase: Case) {
  switch (numberCase) {
    case Case.lowercase:
      return ["千", "百", "十", ""];
    case Case.uppercase:
      return ["仟", "佰", "拾", ""];
    default:
      throw new Error("Invalid case");
  }
}

const higherPlaces = ["", "萬", "億", "兆", "京", "垓", "秭", "穰"];

/**
 * Converts Arabic numerals into spoken-style Chinese numerals.
 *
 * The conversion supports both lowercase (`一二三…`) and uppercase financial
 * (`壹貳參…`) forms, and handles integral plus fractional parts supplied as
 * decimal strings. All parameters accept ASCII digits so callers can feed
 * parsed number parts without worrying about locale formatting.
 */
export class ChineseNumbers {
  private static convert4Digits(
    subString: string,
    numberCase: Case,
    zeroEverHappened: boolean = false
  ): string {
    let zeroHappened = zeroEverHappened;
    let output = "";
    const currentDigits = digits(numberCase);
    for (let i = 0; i < 4; i++) {
      const c: string = subString[i];
      switch (c) {
        case " ":
          continue;
        case "0":
          zeroHappened = true;
          continue;
        default:
          if (zeroHappened) {
            output += currentDigits.get("0");
          }
          zeroHappened = false;
          output += currentDigits.get(c);
          output += places(numberCase)[i];
      }
    }
    return output;
  }

  /**
   * Generates a Chinese numeral representation for the provided number parts.
   *
   * The method expects the integer and decimal portions of a number as digit
   * strings. Leading zeros in the integer portion and trailing zeros in the
   * decimal portion are trimmed automatically so callers can pass values
   * extracted from user input without pre-processing.
   *
   * @param intPart The integer component, e.g. `"1024"`.
   * @param decPart The fractional component without the decimal point, e.g. `"05"`.
   * @param numberCase Selects the glyph set for output.
   * @returns The composed Chinese numeral, such as `"一千零二十四點零五"`.
   * @example
   * ```ts
   * ChineseNumbers.generate("2048", "", Case.lowercase); // "二千零四十八"
   * ```
   */
  static generate(intPart: string, decPart: string, numberCase: Case): string {
    const intTrimmed = TrimZerosAtStart(intPart);
    const decTrimmed = TrimZerosAtEnd(decPart);
    let output = "";
    const currentDigits = digits(numberCase);

    if (intPart.length === 0) {
      output += currentDigits.get("0");
    } else if (intPart === "0") {
      output += currentDigits.get("0");
    } else {
      const intSectionCount = Math.ceil(intTrimmed.length / 4);
      const filledLength = intSectionCount * 4;
      const filled = intTrimmed.padStart(filledLength, " ");
      let readHead = 0;
      let zeroEverHappened = false;
      while (readHead < filledLength) {
        const subString = filled.slice(readHead, readHead + 4);
        if (subString === "0000") {
          zeroEverHappened = true;
          readHead += 4;
          continue;
        }
        const subOutput = this.convert4Digits(
          subString,
          numberCase,
          zeroEverHappened
        );
        zeroEverHappened = false;
        output += subOutput;
        const place = (filledLength - readHead) / 4 - 1;
        output += higherPlaces[place];
        readHead += 4;
      }
    }

    if (decTrimmed.length > 0) {
      output += "點";
      for (let i = 0; i < decTrimmed.length; i++) {
        output += currentDigits.get(decTrimmed[i]);
      }
    }
    if (output.length === 0) {
      return currentDigits.get("0") as string;
    }
    return output;
  }
}
