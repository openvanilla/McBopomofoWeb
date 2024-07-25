const kMinimalBopomofoLength = 1;
const kMinimalBrailleLength = 2;

/**
 * Represents the Consonants in Bopomofo.
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
  const map = new Map<Consonant, string[]>([
    [Consonant.ㄅ, ["⠕", "135"]],
    [Consonant.ㄆ, ["⠏", "1234"]],
    [Consonant.ㄇ, ["⠍", "134"]],
    [Consonant.ㄈ, ["⠟", "12345"]],
    [Consonant.ㄉ, ["⠙", "145"]],
    [Consonant.ㄊ, ["⠋", "124"]],
    [Consonant.ㄋ, ["⠝", "1345"]],
    [Consonant.ㄌ, ["⠉", "14"]],
    [Consonant.ㄍ, ["⠅", "13"]],
    [Consonant.ㄎ, ["⠇", "123"]],
    [Consonant.ㄏ, ["⠗", "1235"]],
    [Consonant.ㄐ, ["⠅", "13"]],
    [Consonant.ㄑ, ["⠚", "245"]],
    [Consonant.ㄒ, ["⠑", "15"]],
    [Consonant.ㄓ, ["⠁", "1"]],
    [Consonant.ㄔ, ["⠃", "12"]],
    [Consonant.ㄕ, ["⠊", "24"]],
    [Consonant.ㄖ, ["⠛", "1245"]],
    [Consonant.ㄗ, ["⠓", "125"]],
    [Consonant.ㄘ, ["⠚", "245"]],
    [Consonant.ㄙ, ["⠑", "15"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values()).map((v) => v[0]);

  export function fromBpmf(b: string): Consonant | undefined {
    if (map.has(b as Consonant)) {
      return b as Consonant;
    }
    return undefined;
  }
  export function fromBraille(b: string): Consonant | undefined {
    for (let [key, value] of map) {
      if (value[0] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): Consonant | undefined {
    for (let [key, value] of map) {
      if (value[1] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: Consonant): string {
    return c;
  }
  export function toBraille(c: Consonant): string {
    return (map.get(c) as string[])[0];
  }
  export function toBrailleCode(c: Consonant): string {
    return (map.get(c) as string[])[1];
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

/** Represents the middle vowels in Bopomofo. */
enum MiddleVowel {
  ㄧ = "ㄧ",
  ㄨ = "ㄨ",
  ㄩ = "ㄩ",
}

namespace MiddleVowel {
  const map = new Map<MiddleVowel, string[]>([
    [MiddleVowel.ㄧ, ["⠡", "16"]],
    [MiddleVowel.ㄨ, ["⠌", "34"]],
    [MiddleVowel.ㄩ, ["⠳", "1256"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values()).map((v) => v[0]);
  export function fromBpmf(b: string): MiddleVowel | undefined {
    if (map.has(b as MiddleVowel)) {
      return b as MiddleVowel;
    }
    return undefined;
  }
  export function fromBraille(b: string): MiddleVowel | undefined {
    for (let [key, value] of map) {
      if (value[0] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): MiddleVowel | undefined {
    for (let [key, value] of map) {
      if (value[1] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: MiddleVowel): string {
    return c;
  }
  export function toBraille(c: MiddleVowel): string {
    return (map.get(c) as string[])[0];
  }
  export function toBrailleCode(c: MiddleVowel): string {
    return (map.get(c) as string[])[1];
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
  const map = new Map<Vowel, string[]>([
    [Vowel.ㄚ, ["⠜", "345"]],
    [Vowel.ㄛ, ["⠣", "126"]],
    [Vowel.ㄜ, ["⠮", "2346"]],
    [Vowel.ㄝ, ["⠢", "26"]],
    [Vowel.ㄞ, ["⠺", "2456"]],
    [Vowel.ㄟ, ["⠴", "356"]],
    [Vowel.ㄠ, ["⠩", "146"]],
    [Vowel.ㄡ, ["⠷", "12356"]],
    [Vowel.ㄢ, ["⠧", "1236"]],
    [Vowel.ㄣ, ["⠥", "136"]],
    [Vowel.ㄤ, ["⠭", "1346"]],
    [Vowel.ㄥ, ["⠵", "1356"]],
    [Vowel.ㄦ, ["⠱", "156"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values()).map((v) => v[0]);
  export function fromBpmf(b: string): Vowel | undefined {
    if (map.has(b as Vowel)) {
      return b as Vowel;
    }
    return undefined;
  }
  export function fromBraille(b: string): Vowel | undefined {
    for (let [key, value] of map) {
      if (value[0] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): Vowel | undefined {
    for (let [key, value] of map) {
      if (value[1] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: Vowel): string {
    return c;
  }
  export function toBraille(c: Vowel): string {
    return (map.get(c) as string[])[0];
  }
  export function toBrailleCode(c: Vowel): string {
    return (map.get(c) as string[])[1];
  }
}

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
    [ㄧ_Combination.ㄧㄚ, ["⠾", "23456"]],
    [ㄧ_Combination.ㄧㄛ, ["⠴", "356"]],
    [ㄧ_Combination.ㄧㄝ, ["⠬", "346"]],
    [ㄧ_Combination.ㄧㄞ, ["⠢", "26"]],
    [ㄧ_Combination.ㄧㄠ, ["⠪", "246"]],
    [ㄧ_Combination.ㄧㄡ, ["⠎", "234"]],
    [ㄧ_Combination.ㄧㄢ, ["⠞", "2345"]],
    [ㄧ_Combination.ㄧㄣ, ["⠹", "1456"]],
    [ㄧ_Combination.ㄧㄤ, ["⠨", "46"]],
    [ㄧ_Combination.ㄧㄥ, ["⠽", "13456"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values()).map((v) => v[0]);
  export function fromBpmf(b: string): ㄧ_Combination | undefined {
    b = "ㄧ" + b;
    if (map.has(b as ㄧ_Combination)) {
      return b as ㄧ_Combination;
    }
    return undefined;
  }
  export function fromBraille(b: string): ㄧ_Combination | undefined {
    for (let [key, value] of map) {
      if (value[0] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): ㄧ_Combination | undefined {
    for (let [key, value] of map) {
      if (value[1] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: ㄧ_Combination): string {
    return c;
  }
  export function toBraille(c: ㄧ_Combination): string {
    return (map.get(c) as string[])[0];
  }
  export function toBrailleCode(c: ㄧ_Combination): string {
    return (map.get(c) as string[])[1];
  }
}

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
    [ㄨ_Combination.ㄨㄚ, ["⠔", "35,"]],
    [ㄨ_Combination.ㄨㄛ, ["⠒", "25"]],
    [ㄨ_Combination.ㄨㄞ, ["⠶", "2356"]],
    [ㄨ_Combination.ㄨㄟ, ["⠫", "1246"]],
    [ㄨ_Combination.ㄨㄢ, ["⠻", "12456"]],
    [ㄨ_Combination.ㄨㄣ, ["⠿", "12345"]],
    [ㄨ_Combination.ㄨㄤ, ["⠸", "456"]],
    [ㄨ_Combination.ㄨㄥ, ["⠯", "12346"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values()).map((v) => v[0]);
  export function fromBpmf(b: string): ㄨ_Combination | undefined {
    b = "ㄨ" + b;
    if (map.has(b as ㄨ_Combination)) {
      return b as ㄨ_Combination;
    }
    return undefined;
  }
  export function fromBraille(b: string): ㄨ_Combination | undefined {
    for (let [key, value] of map) {
      if (value[0] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): ㄨ_Combination | undefined {
    for (let [key, value] of map) {
      if (value[1] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: ㄨ_Combination): string {
    return c;
  }
  export function toBraille(c: ㄨ_Combination): string {
    return (map.get(c) as string[])[0];
  }
  export function toBrailleCode(c: ㄨ_Combination): string {
    return (map.get(c) as string[])[1];
  }
}

enum ㄩ_Combination {
  ㄩㄝ = "ㄩㄝ",
  ㄩㄢ = "ㄩㄢ",
  ㄩㄣ = "ㄩㄣ",
  ㄩㄥ = "ㄩㄥ",
}
namespace ㄩ_Combination {
  const map = new Map<ㄩ_Combination, string[]>([
    [ㄩ_Combination.ㄩㄝ, ["⠦", "236"]],
    [ㄩ_Combination.ㄩㄢ, ["⠘", "45"]],
    [ㄩ_Combination.ㄩㄣ, ["⠲", "256"]],
    [ㄩ_Combination.ㄩㄥ, ["⠖", "235"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values()).map((v) => v[0]);
  export function fromBpmf(b: string): ㄩ_Combination | undefined {
    b = "ㄩ" + b;
    if (map.has(b as ㄩ_Combination)) {
      return b as ㄩ_Combination;
    }
    return undefined;
  }
  export function fromBraille(b: string): ㄩ_Combination | undefined {
    for (let [key, value] of map) {
      if (value[0] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): ㄩ_Combination | undefined {
    for (let [key, value] of map) {
      if (value[1] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: ㄩ_Combination): string {
    return c;
  }
  export function toBraille(c: ㄩ_Combination): string {
    return (map.get(c) as string[])[0];
  }
  export function toBrailleCode(c: ㄩ_Combination): string {
    return (map.get(c) as string[])[1];
  }
}

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
    [Tone.tone1, ["⠄", "3"]],
    [Tone.tone2, ["⠂", "2"]],
    [Tone.tone3, ["⠈", "4"]],
    [Tone.tone4, ["⠐", "5"]],
    [Tone.tone5, ["⠁", "1"]],
  ]);

  export const allBpmf: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values()).map((v) => v[0]);
  export function fromBpmf(b: string): Tone | undefined {
    if (map.has(b as Tone)) {
      return b as Tone;
    }
    return undefined;
  }
  export function fromBraille(b: string): Tone | undefined {
    for (let [key, value] of map) {
      if (value[0] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): Tone | undefined {
    for (let [key, value] of map) {
      if (value[1] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toBpmf(c: Tone): string {
    return c;
  }
  export function toBraille(c: Tone): string {
    return (map.get(c) as string[])[0];
  }
  export function toBrailleCode(c: Tone): string {
    return (map.get(c) as string[])[1];
  }
}

export class BopomofoSyllable {
  bpmf: string;
  braille: string;

  constructor(bpmf: string, braille: string) {
    this.bpmf = bpmf;
    this.braille = braille;
  }

  private static makeBpmf(
    consonant: Consonant | undefined,
    middleVowel: MiddleVowel | undefined = undefined,
    vowel: Vowel | undefined,
    tone: Tone
  ): string {
    let output = "";
    if (consonant != undefined) {
      output += Consonant.toBpmf(consonant);
    }
    if (middleVowel != undefined) {
      output += MiddleVowel.toBpmf(middleVowel);
    }
    if (vowel != undefined) {
      output += Vowel.toBpmf(vowel);
    }
    output += Tone.toBpmf(tone);
    return output;
  }

  private static makeBraille(
    consonant: Consonant | undefined,
    middleVowel: MiddleVowel | undefined = undefined,
    vowel: Vowel | undefined,
    tone: Tone
  ): string {
    let output = "";
    if (consonant != undefined) {
      output += Consonant.toBraille(consonant);
    }
    if (vowel != undefined) {
      if (middleVowel != undefined) {
        let combination = MiddleVowel.buildCombination(middleVowel, vowel);
        if (combination != null) {
          if (ㄧ_Combination.allBpmf.includes(combination)) {
            output += ㄧ_Combination.toBraille(combination as ㄧ_Combination);
          } else if (ㄨ_Combination.allBpmf.includes(combination)) {
            output += ㄨ_Combination.toBraille(combination as ㄨ_Combination);
          } else if (ㄩ_Combination.allBpmf.includes(combination)) {
            output += ㄩ_Combination.toBraille(combination as ㄩ_Combination);
          }
        }
      } else {
        output += Vowel.toBraille(vowel);
      }
    } else if (middleVowel != null) {
      output += MiddleVowel.toBraille(middleVowel);
    } else if (consonant != null) {
      if (Consonant.isSingle(consonant)) {
        // ㄭ
        output += "⠱";
      }
    }
    output += Tone.toBraille(tone);
    return output;
  }

  static fromBpmf(bpmf: string): BopomofoSyllable {
    bpmf = bpmf.trim();
    if (bpmf.length < kMinimalBopomofoLength) {
      throw new Error("Invalid Bopomofo length");
    }

    let consonant: Consonant | undefined = undefined;
    let middleVowel: MiddleVowel | undefined = undefined;
    let vowel: Vowel | undefined = undefined;
    let tone: Tone = Tone.tone1;
    for (let i = 0; i < bpmf.length; i++) {
      let c = bpmf[i];
      if (Consonant.allBpmf.includes(c)) {
        if (consonant != undefined) {
          throw new Error("Invalid Bopomofo: multiple consonants");
        }
        if (middleVowel != undefined || vowel != undefined) {
          throw new Error("Invalid Bopomofo: consonant after vowel");
        }
        consonant = Consonant.fromBpmf(c);
      } else if (MiddleVowel.allBpmf.includes(c)) {
        if (middleVowel != undefined) {
          throw new Error("Invalid Bopomofo: multiple middle vowels");
        }
        if (vowel != undefined) {
          throw new Error("Invalid Bopomofo: middle vowel after vowel");
        }
        middleVowel = MiddleVowel.fromBpmf(c);
      } else if (Vowel.allBpmf.includes(c)) {
        if (vowel != undefined) {
          throw new Error("Invalid Bopomofo: multiple vowels");
        }
        if (middleVowel != undefined) {
          let result = MiddleVowel.buildCombination(middleVowel, c);
          if (result == undefined) {
            throw new Error("Invalid Bopomofo: invalid combination");
          }
        }
        vowel = Vowel.fromBpmf(c);
      } else if (Tone.allBpmf.includes(c)) {
        if (
          consonant == undefined &&
          middleVowel == undefined &&
          vowel == undefined
        ) {
          throw new Error(
            "Invalid Bopomofo: tone without consonant, middle vowel, or vowel"
          );
        }

        if (tone != Tone.tone1) {
          throw new Error("Invalid Bopomofo: multiple tones");
        }
        tone = Tone.fromBpmf(c)!;
      } else {
        throw new Error("Invalid Bopomofo: invalid character");
      }
    }

    if (
      consonant == undefined &&
      middleVowel == undefined &&
      vowel == undefined
    ) {
      throw new Error("Invalid Bopomofo: invalid character");
    }

    let braille = BopomofoSyllable.makeBraille(
      consonant,
      middleVowel,
      vowel,
      tone
    );
    return new BopomofoSyllable(bpmf, braille);
  }

  static fromBraille(braille: string): BopomofoSyllable {
    braille = braille.trim();
    if (braille.length < kMinimalBrailleLength) {
      throw new Error("Invalid Braille length");
    }

    function shouldConnectWithYiOrYv(next: string): boolean {
      return (
        next == MiddleVowel.toBraille(MiddleVowel.ㄧ) ||
        next == MiddleVowel.toBraille(MiddleVowel.ㄩ) ||
        ㄧ_Combination.allBraille.includes(next) ||
        ㄩ_Combination.allBraille.includes(next)
      );
    }

    let consonant: Consonant | undefined = undefined;
    let middleVowel: MiddleVowel | undefined = undefined;
    let vowel: Vowel | undefined = undefined;
    let tone: Tone | undefined = undefined;
    for (let i = 0; i < braille.length; i++) {
      let c = braille[i];
      if (c === "⠱") {
        if (i === 0) {
          vowel = Vowel.ㄦ;
        }
        if (consonant != undefined) {
          if (Consonant.isSingle(consonant) == false) {
            throw new Error("Invalid Braille: other");
          }
        }
      } else if (c === "⠁") {
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
          if (tone != undefined) {
            throw new Error("Invalid Braille: multiple tones");
          }
          tone = Tone.tone5;
        }
      } else if (c === "⠑") {
        // ㄙ and ㄒ
        if (consonant !== undefined) {
          throw new Error("Invalid Braille: duplicated consonant");
        }
        if (i + 1 >= braille.length) {
          throw new Error("Invalid Braille: other");
        }
        let next = braille[i + 1];
        if (shouldConnectWithYiOrYv(next)) {
          consonant = Consonant.ㄒ;
        } else {
          consonant = Consonant.ㄙ;
        }
      } else if (c === "⠚") {
        // ㄑ and ㄘ
        if (consonant !== undefined) {
          throw new Error("Invalid Braille: duplicated consonant");
        }
        if (i + 1 >= braille.length) {
          throw new Error("Invalid Braille: other");
        }
        let next = braille[i + 1];
        if (shouldConnectWithYiOrYv(next)) {
          consonant = Consonant.ㄑ;
        } else {
          consonant = Consonant.ㄘ;
        }
      } else if (c === "⠅") {
        // ㄍ and ㄐ
        if (consonant !== undefined) {
          throw new Error("Invalid Braille: duplicated consonant");
        }
        if (i + 1 >= braille.length) {
          throw new Error("Invalid Braille: other");
        }
        let next = braille[i + 1];
        if (shouldConnectWithYiOrYv(next)) {
          consonant = Consonant.ㄐ;
        } else {
          consonant = Consonant.ㄍ;
        }
      } else if (Consonant.allBraille.includes(c)) {
        if (consonant != undefined) {
          throw new Error("Invalid Braille: multiple consonants");
        }
        if (middleVowel != undefined || vowel != undefined) {
          throw new Error("Invalid Braille: consonant after vowel");
        }
        consonant = Consonant.fromBraille(c);
      } else if (MiddleVowel.allBraille.includes(c)) {
        if (middleVowel != undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        if (vowel != undefined) {
          throw new Error("Invalid Braille:  vowel already set");
        }
        middleVowel = MiddleVowel.fromBraille(c);
      } else if (Vowel.allBraille.includes(c)) {
        if (middleVowel != undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        if (vowel != undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        vowel = Vowel.fromBraille(c);
      } else if (ㄧ_Combination.allBraille.includes(c)) {
        if (middleVowel != undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        if (vowel != undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        let combination = ㄧ_Combination.fromBraille(c);
        if (combination == undefined) {
          throw new Error("Invalid Braille: invalid combination");
        }
        middleVowel = MiddleVowel.ㄧ;
        vowel = Vowel.fromBpmf(combination[1]);
      } else if (ㄨ_Combination.allBraille.includes(c)) {
        if (middleVowel != undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        if (vowel != undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        let combination = ㄨ_Combination.fromBraille(c);
        if (combination == undefined) {
          throw new Error("Invalid Braille: invalid combination");
        }
        middleVowel = MiddleVowel.ㄨ;
        vowel = Vowel.fromBpmf(combination[1]);
      } else if (ㄩ_Combination.allBraille.includes(c)) {
        if (middleVowel != undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        if (vowel != undefined) {
          throw new Error("Invalid Braille: multiple middle vowels");
        }
        let combination = ㄩ_Combination.fromBraille(c);
        if (combination == undefined) {
          throw new Error("Invalid Braille: invalid combination");
        }
        middleVowel = MiddleVowel.ㄩ;
        vowel = Vowel.fromBpmf(combination[1]);
      } else if (Tone.allBraille.includes(c)) {
        if (tone != undefined) {
          throw new Error("Invalid Braille: multiple tones");
        }
        tone = Tone.fromBraille(c);
      } else {
        throw new Error("Invalid character in Braille");
      }
    }

    if (tone == undefined) {
      throw new Error("Invalid Braille: no tone");
    }

    if (
      middleVowel == undefined &&
      vowel == undefined &&
      (consonant == undefined || Consonant.isSingle(consonant!) == false)
    ) {
      throw new Error("Invalid Bopomofo: invalid character");
    }

    let bpmf = BopomofoSyllable.makeBpmf(consonant, middleVowel, vowel, tone);
    return new BopomofoSyllable(bpmf, braille);
  }
}
