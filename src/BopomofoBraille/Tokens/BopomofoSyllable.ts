/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { types } from "util";
import { BrailleType } from "./BrailleType";

const kMinimalBopomofoLength = 1;
const kMinimalBrailleLength = 2;

/**
 * Represents the Consonants in Bopomofo.
 * @enum {string}
 */
enum Consonant {
  ㄅ = "ㄅ",
  ㄆ = "ㄆ",
  ㄇ = "ㄇ",
  ㄈ = "ㄈ",
  ㄉ = "ㄉ",
  ㄊ = "ㄊ",
  ㄋ = "ㄋ",
  ㄌ = "ㄌ",
  ㄍ = "ㄍ",
  ㄎ = "ㄎ",
  ㄏ = "ㄏ",
  ㄐ = "ㄐ",
  ㄑ = "ㄑ",
  ㄒ = "ㄒ",
  ㄓ = "ㄓ",
  ㄔ = "ㄔ",
  ㄕ = "ㄕ",
  ㄖ = "ㄖ",
  ㄗ = "ㄗ",
  ㄘ = "ㄘ",
  ㄙ = "ㄙ",
}

namespace Consonant {
  export const map = new Map<Consonant, string[]>([
    [Consonant.ㄅ, ["⠕", "o", "135"]],
    [Consonant.ㄆ, ["⠏", "p", "1234"]],
    [Consonant.ㄇ, ["⠍", "m", "134"]],
    [Consonant.ㄈ, ["⠟", "q", "12345"]],
    [Consonant.ㄉ, ["⠙", "d", "145"]],
    [Consonant.ㄊ, ["⠋", "f", "124"]],
    [Consonant.ㄋ, ["⠝", "n", "1345"]],
    [Consonant.ㄌ, ["⠉", "c", "14"]],
    [Consonant.ㄍ, ["⠅", "k", "13"]],
    [Consonant.ㄎ, ["⠇", "l", "123"]],
    [Consonant.ㄏ, ["⠗", "r", "1235"]],
    [Consonant.ㄐ, ["⠅", "k", "13"]],
    [Consonant.ㄑ, ["⠚", "j", "245"]],
    [Consonant.ㄒ, ["⠑", "e", "15"]],
    [Consonant.ㄓ, ["⠁", "a", "1"]],
    [Consonant.ㄔ, ["⠃", "b", "12"]],
    [Consonant.ㄕ, ["⠊", "i", "24"]],
    [Consonant.ㄖ, ["⠛", "g", "1245"]],
    [Consonant.ㄗ, ["⠓", "h", "125"]],
    [Consonant.ㄘ, ["⠚", "j", "245"]],
    [Consonant.ㄙ, ["⠑", "e", "15"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[][] = [
    Array.from(map.values()).map((v) => v[0]),
    Array.from(map.values()).map((v) => v[1]),
  ];

  export function fromBpmf(b: string): Consonant | undefined {
    if (map.has(b as Consonant)) {
      return b as Consonant;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): Consonant | undefined {
    for (const [key, value] of map) {
      if (value[type] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): Consonant | undefined {
    for (const [key, value] of map) {
      if (value[2] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: Consonant): string {
    return c;
  }
  export function toBraille(
    c: Consonant,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    return (map.get(c) as string[])[type];
  }
  export function toBrailleCode(c: Consonant): string {
    return (map.get(c) as string[])[2];
  }
  export function isSingle(c: Consonant): boolean {
    switch (c) {
      case Consonant.ㄓ:
      case Consonant.ㄔ:
      case Consonant.ㄕ:
      case Consonant.ㄖ:
      case Consonant.ㄗ:
      case Consonant.ㄘ:
      case Consonant.ㄙ:
        return true;
      default:
        break;
    }
    return false;
  }
}

/**
 * Represents the middle vowels in Bopomofo.
 * @enum {string}
 */
enum MiddleVowel {
  ㄧ = "ㄧ",
  ㄨ = "ㄨ",
  ㄩ = "ㄩ",
}

namespace MiddleVowel {
  export const map = new Map<MiddleVowel, string[]>([
    [MiddleVowel.ㄧ, ["⠡", "*", "16"]],
    [MiddleVowel.ㄨ, ["⠌", "/", "34"]],
    [MiddleVowel.ㄩ, ["⠳", "|", "1256"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[][] = [
    Array.from(map.values()).map((v) => v[0]),
    Array.from(map.values()).map((v) => v[1]),
  ];
  export function fromBpmf(b: string): MiddleVowel | undefined {
    if (map.has(b as MiddleVowel)) {
      return b as MiddleVowel;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): MiddleVowel | undefined {
    for (const [key, value] of map) {
      if (value[type] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): MiddleVowel | undefined {
    for (const [key, value] of map) {
      if (value[2] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: MiddleVowel): string {
    return c;
  }
  export function toBraille(
    c: MiddleVowel,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    return (map.get(c) as string[])[type];
  }
  export function toBrailleCode(c: MiddleVowel): string {
    return (map.get(c) as string[])[2];
  }
  export function buildCombination(
    c: MiddleVowel,
    rawValue: string
  ): ㄧ_Combination | ㄨ_Combination | ㄩ_Combination | undefined {
    switch (c) {
      case MiddleVowel.ㄧ:
        return ㄧ_Combination.fromBpmf(rawValue);
      case MiddleVowel.ㄨ:
        return ㄨ_Combination.fromBpmf(rawValue);
      case MiddleVowel.ㄩ:
        return ㄩ_Combination.fromBpmf(rawValue);
    }
  }
}

/**
 * Represents the vowels in Bopomofo.
 * @enum {string}
 */
enum Vowel {
  ㄚ = "ㄚ",
  ㄛ = "ㄛ",
  ㄜ = "ㄜ",
  ㄝ = "ㄝ",
  ㄞ = "ㄞ",
  ㄟ = "ㄟ",
  ㄠ = "ㄠ",
  ㄡ = "ㄡ",
  ㄢ = "ㄢ",
  ㄣ = "ㄣ",
  ㄤ = "ㄤ",
  ㄥ = "ㄥ",
  ㄦ = "ㄦ",
}

namespace Vowel {
  export const map = new Map<Vowel, string[]>([
    [Vowel.ㄚ, ["⠜", ">", "345"]],
    [Vowel.ㄛ, ["⠣", "<", "126"]],
    [Vowel.ㄜ, ["⠮", "!", "2346"]],
    [Vowel.ㄝ, ["⠢", "5", "26"]],
    [Vowel.ㄞ, ["⠺", "w", "2456"]],
    [Vowel.ㄟ, ["⠴", "0", "356"]],
    [Vowel.ㄠ, ["⠩", "%", "146"]],
    [Vowel.ㄡ, ["⠷", "(", "12356"]],
    [Vowel.ㄢ, ["⠧", "v", "1236"]],
    [Vowel.ㄣ, ["⠥", "u", "136"]],
    [Vowel.ㄤ, ["⠭", "x", "1346"]],
    [Vowel.ㄥ, ["⠵", "z", "1356"]],
    [Vowel.ㄦ, ["⠱", ":", "156"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[][] = [
    Array.from(map.values()).map((v) => v[0]),
    Array.from(map.values()).map((v) => v[1]),
  ];
  export function fromBpmf(b: string): Vowel | undefined {
    if (map.has(b as Vowel)) {
      return b as Vowel;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): Vowel | undefined {
    for (const [key, value] of map) {
      if (value[type] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): Vowel | undefined {
    for (const [key, value] of map) {
      if (value[2] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: Vowel): string {
    return c;
  }
  export function toBraille(
    c: Vowel,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    return (map.get(c) as string[])[type];
  }
  export function toBrailleCode(c: Vowel): string {
    return (map.get(c) as string[])[2];
  }
}

/**
 * Represents the combinations of ㄧ in Bopomofo.
 * @enum {string}
 */
enum ㄧ_Combination {
  ㄧㄚ = "ㄧㄚ",
  ㄧㄛ = "ㄧㄛ",
  ㄧㄝ = "ㄧㄝ",
  ㄧㄞ = "ㄧㄞ",
  ㄧㄠ = "ㄧㄠ",
  ㄧㄡ = "ㄧㄡ",
  ㄧㄢ = "ㄧㄢ",
  ㄧㄣ = "ㄧㄣ",
  ㄧㄤ = "ㄧㄤ",
  ㄧㄥ = "ㄧㄥ",
}

namespace ㄧ_Combination {
  const map = new Map<ㄧ_Combination, string[]>([
    [ㄧ_Combination.ㄧㄚ, ["⠾", ")", "23456"]],
    [ㄧ_Combination.ㄧㄛ, ["⠴", "0", "356"]],
    [ㄧ_Combination.ㄧㄝ, ["⠬", "+", "346"]],
    [ㄧ_Combination.ㄧㄞ, ["⠢", "5", "26"]],
    [ㄧ_Combination.ㄧㄠ, ["⠪", "{", "246"]],
    [ㄧ_Combination.ㄧㄡ, ["⠎", "s", "234"]],
    [ㄧ_Combination.ㄧㄢ, ["⠞", "t", "2345"]],
    [ㄧ_Combination.ㄧㄣ, ["⠹", "?", "1456"]],
    [ㄧ_Combination.ㄧㄤ, ["⠨", ".", "46"]],
    [ㄧ_Combination.ㄧㄥ, ["⠽", "y", "13456"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[][] = [
    Array.from(map.values()).map((v) => v[0]),
    Array.from(map.values()).map((v) => v[1]),
  ];
  export function fromBpmf(b: string): ㄧ_Combination | undefined {
    b = "ㄧ" + b;
    if (map.has(b as ㄧ_Combination)) {
      return b as ㄧ_Combination;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): ㄧ_Combination | undefined {
    for (const [key, value] of map) {
      if (value[type] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): ㄧ_Combination | undefined {
    for (const [key, value] of map) {
      if (value[2] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: ㄧ_Combination): string {
    return c;
  }
  export function toBraille(
    c: ㄧ_Combination,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    return (map.get(c) as string[])[type];
  }
  export function toBrailleCode(c: ㄧ_Combination): string {
    return (map.get(c) as string[])[2];
  }
}

/**
 * Represents the combinations of ㄨ in Bopomofo.
 * @enum {string}
 */
enum ㄨ_Combination {
  ㄨㄚ = "ㄨㄚ",
  ㄨㄛ = "ㄨㄛ",
  ㄨㄞ = "ㄨㄞ",
  ㄨㄟ = "ㄨㄟ",
  ㄨㄢ = "ㄨㄢ",
  ㄨㄣ = "ㄨㄣ",
  ㄨㄤ = "ㄨㄤ",
  ㄨㄥ = "ㄨㄥ",
}

namespace ㄨ_Combination {
  const map = new Map<ㄨ_Combination, string[]>([
    [ㄨ_Combination.ㄨㄚ, ["⠔", "9", "35"]],
    [ㄨ_Combination.ㄨㄛ, ["⠒", "3", "25"]],
    [ㄨ_Combination.ㄨㄞ, ["⠶", "7", "2356"]],
    [ㄨ_Combination.ㄨㄟ, ["⠫", "$", "1246"]],
    [ㄨ_Combination.ㄨㄢ, ["⠻", "}", "12456"]],
    [ㄨ_Combination.ㄨㄣ, ["⠿", "=", "12345"]],
    [ㄨ_Combination.ㄨㄤ, ["⠸", "_", "456"]],
    [ㄨ_Combination.ㄨㄥ, ["⠯", "&", "12346"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[][] = [
    Array.from(map.values()).map((v) => v[0]),
    Array.from(map.values()).map((v) => v[1]),
  ];
  export function fromBpmf(b: string): ㄨ_Combination | undefined {
    b = "ㄨ" + b;
    if (map.has(b as ㄨ_Combination)) {
      return b as ㄨ_Combination;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): ㄨ_Combination | undefined {
    for (const [key, value] of map) {
      if (value[type] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): ㄨ_Combination | undefined {
    for (const [key, value] of map) {
      if (value[2] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: ㄨ_Combination): string {
    return c;
  }
  export function toBraille(
    c: ㄨ_Combination,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    return (map.get(c) as string[])[type];
  }
  export function toBrailleCode(c: ㄨ_Combination): string {
    return (map.get(c) as string[])[2];
  }
}

/**
 * Represents the combinations of ㄩ in Bopomofo.
 * @enum {string}
 */
enum ㄩ_Combination {
  ㄩㄝ = "ㄩㄝ",
  ㄩㄢ = "ㄩㄢ",
  ㄩㄣ = "ㄩㄣ",
  ㄩㄥ = "ㄩㄥ",
}
namespace ㄩ_Combination {
  const map = new Map<ㄩ_Combination, string[]>([
    [ㄩ_Combination.ㄩㄝ, ["⠦", "8", "236"]],
    [ㄩ_Combination.ㄩㄢ, ["⠘", "~", "45"]],
    [ㄩ_Combination.ㄩㄣ, ["⠲", "4", "256"]],
    [ㄩ_Combination.ㄩㄥ, ["⠖", "6", "235"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[][] = [
    Array.from(map.values()).map((v) => v[0]),
    Array.from(map.values()).map((v) => v[1]),
  ];
  export function fromBpmf(b: string): ㄩ_Combination | undefined {
    b = "ㄩ" + b;
    if (map.has(b as ㄩ_Combination)) {
      return b as ㄩ_Combination;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): ㄩ_Combination | undefined {
    for (const [key, value] of map) {
      if (value[type] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): ㄩ_Combination | undefined {
    for (const [key, value] of map) {
      if (value[2] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: ㄩ_Combination): string {
    return c;
  }
  export function toBraille(
    c: ㄩ_Combination,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    return (map.get(c) as string[])[type];
  }
  export function toBrailleCode(c: ㄩ_Combination): string {
    return (map.get(c) as string[])[2];
  }
}

/**
 * Represents the tones in Bopomofo.
 * @enum {string}
 */
enum Tone {
  tone1 = "",
  tone2 = "ˊ",
  tone3 = "ˇ",
  tone4 = "ˋ",
  tone5 = "˙",
}

/** Represents the tones in Bopomofo. */
namespace Tone {
  const map = new Map<Tone, string[]>([
    [Tone.tone1, ["⠄", "'", "3"]],
    [Tone.tone2, ["⠂", "1", "2"]],
    [Tone.tone3, ["⠈", "`", "4"]],
    [Tone.tone4, ["⠐", '"', "5"]],
    [Tone.tone5, ["⠁", "a", "1"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[][] = [
    Array.from(map.values()).map((v) => v[0]),
    Array.from(map.values()).map((v) => v[1]),
  ];
  export function fromBpmf(b: string): Tone | undefined {
    if (map.has(b as Tone)) {
      return b as Tone;
    }
    return undefined;
  }
  export function fromBraille(
    b: string,
    type: BrailleType = BrailleType.UNICODE
  ): Tone | undefined {
    for (const [key, value] of map) {
      if (value[type] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): Tone | undefined {
    for (const [key, value] of map) {
      if (value[2] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: Tone): string {
    return c;
  }
  export function toBraille(
    c: Tone,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    return (map.get(c) as string[])[type];
  }
  export function toBrailleCode(c: Tone): string {
    return (map.get(c) as string[])[2];
  }
}

/** Represents the Bopomofo syllables.  */
export class BopomofoSyllable {
  constructor(
    /** The Bopomofo syllables in string representation. */
    public bpmf: string,
    /** The Braille in string representation. */
    public braille: string,
    /** The type of Braille representation. */
    public type: BrailleType
  ) {}

  private static makeBpmf(
    consonant: Consonant | undefined,
    middleVowel: MiddleVowel | undefined = undefined,
    vowel: Vowel | undefined,
    tone: Tone
  ): string {
    let output = "";
    if (consonant !== undefined) {
      output += Consonant.toBpmf(consonant);
    }
    if (middleVowel !== undefined) {
      output += MiddleVowel.toBpmf(middleVowel);
    }
    if (vowel !== undefined) {
      output += Vowel.toBpmf(vowel);
    }
    output += Tone.toBpmf(tone);
    return output;
  }

  private static makeBraille(
    consonant: Consonant | undefined,
    middleVowel: MiddleVowel | undefined = undefined,
    vowel: Vowel | undefined,
    tone: Tone,
    type: BrailleType = BrailleType.UNICODE
  ): string {
    let output = "";
    if (consonant !== undefined) {
      output += Consonant.toBraille(consonant, type);
    }
    if (vowel !== undefined) {
      if (middleVowel !== undefined) {
        const combination = MiddleVowel.buildCombination(middleVowel, vowel);
        if (combination !== undefined) {
          if (ㄧ_Combination.allBpmf.includes(combination)) {
            output += ㄧ_Combination.toBraille(combination as ㄧ_Combination);
          } else if (ㄨ_Combination.allBpmf.includes(combination)) {
            output += ㄨ_Combination.toBraille(combination as ㄨ_Combination);
          } else if (ㄩ_Combination.allBpmf.includes(combination)) {
            output += ㄩ_Combination.toBraille(combination as ㄩ_Combination);
          }
        }
      } else {
        output += Vowel.toBraille(vowel, type);
      }
    } else if (middleVowel !== undefined) {
      output += MiddleVowel.toBraille(middleVowel, type);
    } else if (consonant !== undefined) {
      if (Consonant.isSingle(consonant)) {
        // ㄭ
        output += "⠱";
      }
    }
    output += Tone.toBraille(tone, type);
    return output;
  }

  /**
   * Creates a new instance from a Bopomofo string.
   * @param bpmf The Bopomofo string.
   * @returns A new instance of BopomofoSyllable.
   */
  /**
   * Creates a new instance from a Bopomofo string.
   * @param bpmf The Bopomofo string.
   * @returns A new instance of BopomofoSyllable.
   */
  static fromBpmf(
    bpmf: string,
    type: BrailleType = BrailleType.UNICODE
  ): BopomofoSyllable {
    bpmf = bpmf.trim();
    if (bpmf.length < kMinimalBopomofoLength) {
      throw new Error("Invalid Bopomofo length");
    }

    let consonant: Consonant | undefined;
    let middleVowel: MiddleVowel | undefined;
    let vowel: Vowel | undefined;
    let tone: Tone = Tone.tone1;

    for (const c of bpmf) {
      if (Consonant.allBpmf.includes(c)) {
        if (consonant !== undefined) {
          throw new Error("Invalid Bopomofo: multiple consonants");
        }
        if (middleVowel !== undefined || vowel !== undefined) {
          throw new Error("Invalid Bopomofo: consonant after vowel");
        }
        consonant = Consonant.fromBpmf(c);
      } else if (MiddleVowel.allBpmf.includes(c)) {
        if (middleVowel !== undefined) {
          throw new Error("Invalid Bopomofo: multiple middle vowels");
        }
        if (vowel !== undefined) {
          throw new Error("Invalid Bopomofo: middle vowel after vowel");
        }
        middleVowel = MiddleVowel.fromBpmf(c);
      } else if (Vowel.allBpmf.includes(c)) {
        if (vowel !== undefined) {
          throw new Error("Invalid Bopomofo: multiple vowels");
        }
        if (middleVowel !== undefined) {
          const result = MiddleVowel.buildCombination(middleVowel, c);
          if (result === undefined) {
            throw new Error("Invalid Bopomofo: invalid combination");
          }
        }
        vowel = Vowel.fromBpmf(c);
      } else if (Tone.allBpmf.includes(c)) {
        if (
          consonant === undefined &&
          middleVowel === undefined &&
          vowel === undefined
        ) {
          throw new Error(
            "Invalid Bopomofo: tone without consonant, middle vowel, or vowel"
          );
        }

        if (tone !== Tone.tone1) {
          throw new Error("Invalid Bopomofo: multiple tones");
        }
        tone = Tone.fromBpmf(c)!;
      } else {
        throw new Error("Invalid Bopomofo: invalid character");
      }
    }

    if (
      consonant === undefined &&
      middleVowel === undefined &&
      vowel === undefined
    ) {
      throw new Error("Invalid Bopomofo: invalid character");
    }

    const braille = BopomofoSyllable.makeBraille(
      consonant,
      middleVowel,
      vowel,
      tone,
      type
    );
    return new BopomofoSyllable(bpmf, braille, type);
  }

  private static shouldConnectWithYiOrYv(
    next: string,
    type: BrailleType
  ): boolean {
    return (
      next === MiddleVowel.toBraille(MiddleVowel.ㄧ, type) ||
      next === MiddleVowel.toBraille(MiddleVowel.ㄩ, type) ||
      ㄧ_Combination.allBraille[type].includes(next) ||
      ㄩ_Combination.allBraille[type].includes(next)
    );
  }

  /**
   * Creates a new instance from a Braille string.
   * @param braille The Braille string.
   * @returns A new instance of BopomofoSyllable.
   */
  static fromBraille(
    braille: string,
    type: BrailleType = BrailleType.UNICODE
  ): BopomofoSyllable {
    braille = braille.trim();
    if (braille.length < kMinimalBrailleLength) {
      throw new Error("Invalid Braille length");
    }

    let consonant: Consonant | undefined;
    let middleVowel: MiddleVowel | undefined;
    let vowel: Vowel | undefined;
    let tone: Tone | undefined;

    for (let i = 0; i < braille.length; i++) {
      const c = braille[i];

      if (c === Vowel.map.get(Vowel.ㄦ)![type]) {
        if (i === 0) {
          vowel = Vowel.ㄦ;
        } else if (consonant !== undefined && !Consonant.isSingle(consonant)) {
          throw new Error("Invalid Braille: other");
        }
        continue;
      }

      if (c === Consonant.map.get(Consonant.ㄓ)![type]) {
        // ㄓ or tone5
        if (i === 0) {
          consonant = Consonant.ㄓ;
        } else {
          if (
            consonant === undefined &&
            middleVowel === undefined &&
            vowel === undefined
          ) {
            throw new Error(
              "Invalid Braille: tone without consonant, middle vowel, or vowel"
            );
          }
          if (tone !== undefined) {
            throw new Error("Invalid Braille: multiple tones");
          }
          tone = Tone.tone5;
        }
        continue;
      }

      const ㄒㄙ = Consonant.map.get(Consonant.ㄒ)![type];
      const ㄑㄘ = Consonant.map.get(Consonant.ㄑ)![type];
      const ㄐㄍ = Consonant.map.get(Consonant.ㄐ)![type];

      if (c === ㄒㄙ || c === ㄑㄘ || c === ㄐㄍ) {
        if (consonant !== undefined) {
          throw new Error("Invalid Braille: duplicated consonant");
        }
        if (i + 1 >= braille.length) {
          throw new Error("Invalid Braille: other");
        }
        const next = braille[i + 1];

        // Determines if the next character indicates connection with 'ㄧ' (yi)
        // or 'ㄩ' (yv) which affects the consonant interpretation (e.g., ㄒ/ㄙ,
        // ㄑ/ㄘ, ㄐ/ㄍ).
        const isConnected = BopomofoSyllable.shouldConnectWithYiOrYv(
          next,
          type
        );

        if (c === ㄒㄙ) {
          consonant = isConnected ? Consonant.ㄒ : Consonant.ㄙ;
        } else if (c === ㄑㄘ) {
          consonant = isConnected ? Consonant.ㄑ : Consonant.ㄘ;
        } else if (c === ㄐㄍ) {
          consonant = isConnected ? Consonant.ㄐ : Consonant.ㄍ;
        }
        continue;
      }

      if (Consonant.allBraille[type].includes(c)) {
        if (consonant !== undefined) {
          throw new Error("Invalid Braille: multiple consonants");
        }
        if (middleVowel !== undefined || vowel !== undefined) {
          throw new Error("Invalid Braille: consonant after vowel");
        }
        consonant = Consonant.fromBraille(c, type);
      } else if (MiddleVowel.allBraille[type].includes(c)) {
        if (middleVowel !== undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        if (vowel !== undefined) {
          throw new Error("Invalid Braille:  vowel already set");
        }
        middleVowel = MiddleVowel.fromBraille(c, type);
      } else if (Vowel.allBraille[type].includes(c)) {
        if (middleVowel !== undefined || vowel !== undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        vowel = Vowel.fromBraille(c, type);
      } else if (ㄧ_Combination.allBraille[type].includes(c)) {
        if (middleVowel !== undefined || vowel !== undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        const combination = ㄧ_Combination.fromBraille(c, type);
        if (combination === undefined) {
          throw new Error("Invalid Braille: invalid combination");
        }
        middleVowel = MiddleVowel.ㄧ;
        vowel = Vowel.fromBpmf(combination[1]);
      } else if (ㄨ_Combination.allBraille[type].includes(c)) {
        if (middleVowel !== undefined || vowel !== undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        const combination = ㄨ_Combination.fromBraille(c, type);
        if (combination === undefined) {
          throw new Error("Invalid Braille: invalid combination");
        }
        middleVowel = MiddleVowel.ㄨ;
        vowel = Vowel.fromBpmf(combination[1]);
      } else if (ㄩ_Combination.allBraille[type].includes(c)) {
        if (middleVowel !== undefined || vowel !== undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        const combination = ㄩ_Combination.fromBraille(c, type);
        if (combination === undefined) {
          throw new Error("Invalid Braille: invalid combination");
        }
        middleVowel = MiddleVowel.ㄩ;
        vowel = Vowel.fromBpmf(combination[1]);
      } else if (Tone.allBraille[type].includes(c)) {
        if (tone !== undefined) {
          throw new Error("Invalid Braille: multiple tones");
        }
        tone = Tone.fromBraille(c, type);
      } else {
        throw new Error("Invalid character in Braille");
      }
    }

    if (tone === undefined) {
      throw new Error("Invalid Braille: no tone");
    }

    if (
      middleVowel === undefined &&
      vowel === undefined &&
      (consonant === undefined || Consonant.isSingle(consonant!) === false)
    ) {
      throw new Error("Invalid Braille: invalid character");
    }

    const bpmf = BopomofoSyllable.makeBpmf(consonant, middleVowel, vowel, tone);
    return new BopomofoSyllable(bpmf, braille, type);
  }
}
