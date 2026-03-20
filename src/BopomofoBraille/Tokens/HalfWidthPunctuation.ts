/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BrailleType } from "./BrailleType";

/**
 * Represents the half-width punctuations.
 *
 * Note: see https://en.wikipedia.org/wiki/Braille_ASCII
 *
 * @enum {string}
 */
export enum HalfWidthPunctuation {
  period = ".",
  comma = ",",
  semicolon = ";",
  dash = "'",
  questionMark = "?",
  exclamationMark = "!",
  colon = ":",
  slash = "-",
  star = "*",
  dotDotDot = "...",
  singleQuotationMarkLeft = "‘",
  singleQuotationMarkRight = "’",
  doubleQuotationMarkLeft = "“",
  doubleQuotationMarkRight = "”",
  parenthesesLeft = "(",
  parenthesesRight = ")",
  bracketLeft = "[",
  bracketRight = "]",
}

export namespace HalfWidthPunctuation {
  const map = new Map<HalfWidthPunctuation, string[]>([
    [HalfWidthPunctuation.period, ["⠲", "."]],
    [HalfWidthPunctuation.comma, ["⠂", ","]],
    [HalfWidthPunctuation.semicolon, ["⠒", ";"]],
    [HalfWidthPunctuation.dash, ["⠄", "'"]],
    [HalfWidthPunctuation.questionMark, ["⠦", "?"]],
    [HalfWidthPunctuation.exclamationMark, ["⠖", "!"]],
    [HalfWidthPunctuation.colon, ["⠒", ":"]],
    [HalfWidthPunctuation.slash, ["⠤", "-"]],
    [HalfWidthPunctuation.star, ["⠔", "*"]],
    [HalfWidthPunctuation.dotDotDot, ["⠄⠄⠄", "..."]],
    [HalfWidthPunctuation.singleQuotationMarkLeft, ["⠠⠦", "8"]],
    [HalfWidthPunctuation.singleQuotationMarkRight, ["⠴⠄", "0"]],
    [HalfWidthPunctuation.doubleQuotationMarkLeft, ["⠦", "8"]],
    [HalfWidthPunctuation.doubleQuotationMarkRight, ["⠴", "0"]],
    [HalfWidthPunctuation.parenthesesLeft, ["⠶", "("]],
    [HalfWidthPunctuation.parenthesesRight, ["⠶", ")"]],
    [HalfWidthPunctuation.bracketLeft, ["⠠⠶", "["]],
    [HalfWidthPunctuation.bracketRight, ["⠶⠄", "]"]],
  ]);

  export const allPunctuation: string[] = Array.from(map.keys());
  export const allBraille: string[][] = [
    Array.from(map.values()).map((v) => v[0]),
    Array.from(map.values()).map((v) => v[1]),
  ];

  export function fromPunctuation(b: string): HalfWidthPunctuation | undefined {
    if (map.has(b as HalfWidthPunctuation)) {
      return b as HalfWidthPunctuation;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): HalfWidthPunctuation | undefined {
    for (const [key, value] of map) {
      if (value[type] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: HalfWidthPunctuation): string {
    return c;
  }
  export function toBraille(
    c: HalfWidthPunctuation,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    return map.get(c)![type];
  }
}
