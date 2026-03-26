/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BrailleType } from "./BrailleType";

/**
 * Represents the digits.
 * @enum {string}
 */
export enum Digit {
  zero = "0",
  one = "1",
  two = "2",
  three = "3",
  four = "4",
  five = "5",
  six = "6",
  seven = "7",
  eight = "8",
  nine = "9",
}

export namespace Digit {
  const map = new Map<Digit, string>([
    [Digit.zero, "⠴"],
    [Digit.one, "⠂"],
    [Digit.two, "⠆"],
    [Digit.three, "⠒"],
    [Digit.four, "⠲"],
    [Digit.five, "⠢"],
    [Digit.six, "⠖"],
    [Digit.seven, "⠶"],
    [Digit.eight, "⠦"],
    [Digit.nine, "⠔"],
  ]);

  export const allDigits: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values());

  export function fromDigit(b: string): Digit | undefined {
    if (map.has(b as Digit)) {
      return b as Digit;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): Digit | undefined {
    if (type === BrailleType.ASCII) {
      return fromDigit(b);
    }
    for (const [key, value] of map) {
      if (value === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toDigit(c: Digit): string {
    return c;
  }
  export function toBraille(
    c: Digit,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    if (type === BrailleType.ASCII) {
      return toDigit(c);
    }
    return map.get(c) as string;
  }
}

/**
 * Represents the digit related punctuations.
 * @enum {string}
 */
export enum DigitRelated {
  point = ".",
  percent = "%",
  celsius = "°C",
}

export namespace DigitRelated {
  const map = new Map<DigitRelated, string[]>([
    [DigitRelated.point, ["⠨", "."]],
    [DigitRelated.percent, ["⠈⠴", "`%"]],
    [DigitRelated.celsius, ["⠘⠨⠡ ⠰⠠⠉", "~.* ;,c"]],
  ]);

  export const allDigits: string[] = Array.from(map.keys());
  export const allBraille: string[][] = [
    Array.from(map.values()).map((v) => v[0]),
    Array.from(map.values()).map((v) => v[1]),
  ];

  export function fromPunctuation(b: string): DigitRelated | undefined {
    if (map.has(b as DigitRelated)) {
      return b as DigitRelated;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): DigitRelated | undefined {
    for (const [key, value] of map) {
      if (value[type] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toPunctuation(c: DigitRelated): string {
    return c;
  }
  export function toBraille(
    c: DigitRelated,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    return (map.get(c) as string[])[type];
  }
}
