/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

/**
 * Represents the full-width punctuations.
 * @enum {string}
 */
export enum FullWidthPunctuation {
  period = "。",
  dot = "·",
  comma = "，",
  semicolon = "；",
  ideographicComma = "、",
  questionMark = "？",
  exclamationMark = "！",
  colon = "：",
  personNameMark = "╴",
  slash = "—",
  bookNameMark = "﹏",
  ellipsis = "…",
  doubleRing = "◎",
  singleQuotationMarkLeft = "「",
  singleQuotationMarkRight = "」",
  doubleQuotationMarkLeft = "『",
  doubleQuotationMarkRight = "』",
  parenthesesLeft = "（",
  parenthesesRight = "）",
  bracketLeft = "〔",
  bracketRight = "〕",
  braceLeft = "｛",
  braceRight = "｝",
}

export namespace FullWidthPunctuation {
  const map = new Map<FullWidthPunctuation, string>([
    [FullWidthPunctuation.period, "⠤"],
    [FullWidthPunctuation.dot, "⠤"],
    [FullWidthPunctuation.comma, "⠆"],
    [FullWidthPunctuation.semicolon, "⠰"],
    [FullWidthPunctuation.ideographicComma, "⠠"],
    [FullWidthPunctuation.questionMark, "⠕"],
    [FullWidthPunctuation.exclamationMark, "⠇"],
    [FullWidthPunctuation.colon, "⠒⠒"],
    [FullWidthPunctuation.personNameMark, "⠰⠰"],
    [FullWidthPunctuation.slash, "⠐⠂"],
    [FullWidthPunctuation.bookNameMark, "⠠⠤"],
    [FullWidthPunctuation.ellipsis, "⠐⠐⠐"],
    // [FullWidthPunctuation.referenceMark, "⠼"],
    [FullWidthPunctuation.doubleRing, "⠪⠕"],
    [FullWidthPunctuation.singleQuotationMarkLeft, "⠰⠤"],
    [FullWidthPunctuation.singleQuotationMarkRight, "⠤⠆"],
    [FullWidthPunctuation.doubleQuotationMarkLeft, "⠰⠤⠰⠤"],
    [FullWidthPunctuation.doubleQuotationMarkRight, "⠤⠆⠤⠆"],
    [FullWidthPunctuation.parenthesesLeft, "⠪"],
    [FullWidthPunctuation.parenthesesRight, "⠕"],
    [FullWidthPunctuation.bracketLeft, "⠯"],
    [FullWidthPunctuation.bracketRight, "⠽"],
    [FullWidthPunctuation.braceLeft, "⠦"],
    [FullWidthPunctuation.braceRight, "⠴"],
  ]);

  export const allPunctuation: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values());

  export function fromBpmf(b: string): FullWidthPunctuation | undefined {
    if (map.has(b as FullWidthPunctuation)) {
      return b as FullWidthPunctuation;
    }
    return undefined;
  }
  export function fromBraille(b: string): FullWidthPunctuation | undefined {
    for (let [key, value] of map) {
      if (value === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: FullWidthPunctuation): string {
    return c;
  }
  export function toBraille(c: FullWidthPunctuation): string {
    return map.get(c) as string;
  }
  export function supposedToBeAtStart(c: FullWidthPunctuation): boolean {
    let validPunctuation = [
      FullWidthPunctuation.singleQuotationMarkLeft,
      FullWidthPunctuation.doubleQuotationMarkLeft,
      FullWidthPunctuation.parenthesesLeft,
      FullWidthPunctuation.bracketLeft,
      FullWidthPunctuation.braceLeft,
    ];
    return validPunctuation.includes(c);
  }
}
