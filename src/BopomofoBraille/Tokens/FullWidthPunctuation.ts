/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BrailleType } from "./BrailleType";

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
  referenceMark = "※",
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
  const map = new Map<FullWidthPunctuation, string[]>([
    [FullWidthPunctuation.period, ["⠤", "-"]],
    [FullWidthPunctuation.dot, ["⠤", "."]],
    [FullWidthPunctuation.comma, ["⠆", "2"]],
    [FullWidthPunctuation.semicolon, ["⠰", ";"]],
    [FullWidthPunctuation.ideographicComma, ["⠠", ","]],
    [FullWidthPunctuation.questionMark, ["⠕", "?"]],
    [FullWidthPunctuation.exclamationMark, ["⠇", "l"]],
    [FullWidthPunctuation.colon, ["⠒⠒", "33"]],
    [FullWidthPunctuation.personNameMark, ["⠰⠰", "|"]],
    [FullWidthPunctuation.slash, ["⠐⠂", "-"]],
    [FullWidthPunctuation.bookNameMark, ["⠠⠤", "~"]],
    [FullWidthPunctuation.ellipsis, ["⠐⠐⠐", "'''"]],
    [FullWidthPunctuation.referenceMark, ["⠈⠼", "`#"]],
    [FullWidthPunctuation.doubleRing, ["⠪⠕", "{o"]],
    [FullWidthPunctuation.singleQuotationMarkLeft, ["⠰⠤", ";-"]],
    [FullWidthPunctuation.singleQuotationMarkRight, ["⠤⠆", "-2"]],
    [FullWidthPunctuation.doubleQuotationMarkLeft, ["⠰⠤⠰⠤", "88"]],
    [FullWidthPunctuation.doubleQuotationMarkRight, ["⠤⠆⠤⠆", "00"]],
    [FullWidthPunctuation.parenthesesLeft, ["⠪", "{"]],
    [FullWidthPunctuation.parenthesesRight, ["⠕", "o"]],
    [FullWidthPunctuation.bracketLeft, ["⠯", "``("]],
    [FullWidthPunctuation.bracketRight, ["⠽", "``)"]],
    [FullWidthPunctuation.braceLeft, ["⠦", ".("]],
    [FullWidthPunctuation.braceRight, ["⠴", ".)"]],
  ]);

  export const allPunctuation: string[] = Array.from(map.keys());
  export const allBraille: string[][] = [
    Array.from(map.values()).map((v) => v[0]),
    Array.from(map.values()).map((v) => v[1]),
  ];

  export function fromBpmf(b: string): FullWidthPunctuation | undefined {
    if (map.has(b as FullWidthPunctuation)) {
      return b as FullWidthPunctuation;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): FullWidthPunctuation | undefined {
    for (const [key, value] of map) {
      if (value[type] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: FullWidthPunctuation): string {
    return c;
  }
  export function toBraille(
    c: FullWidthPunctuation,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    return map.get(c)![type];
  }
  export function supposedToBeAtStart(c: FullWidthPunctuation): boolean {
    const validPunctuation = [
      FullWidthPunctuation.singleQuotationMarkLeft,
      FullWidthPunctuation.doubleQuotationMarkLeft,
      FullWidthPunctuation.parenthesesLeft,
      FullWidthPunctuation.bracketLeft,
      FullWidthPunctuation.braceLeft,
      FullWidthPunctuation.referenceMark,
    ];
    return validPunctuation.includes(c);
  }
}
