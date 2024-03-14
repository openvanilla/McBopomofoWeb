import { execPath } from "process";

export namespace BopomofoBraille {
  const kMinimalBopomofoLength = 1;
  const kMinimalBrailleLength = 2;

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
    const map = new Map<Consonant, string>([
      [Consonant.ㄅ, "⠕"],
      [Consonant.ㄆ, "⠏"],
      [Consonant.ㄇ, "⠍"],
      [Consonant.ㄈ, "⠟"],
      [Consonant.ㄉ, "⠙"],
      [Consonant.ㄊ, "⠋"],
      [Consonant.ㄋ, "⠝"],
      [Consonant.ㄌ, "⠉"],
      [Consonant.ㄍ, "⠅"],
      [Consonant.ㄎ, "⠇"],
      [Consonant.ㄏ, "⠗"],
      [Consonant.ㄐ, "⠅"],
      [Consonant.ㄑ, "⠚"],
      [Consonant.ㄒ, "⠑"],
      [Consonant.ㄓ, "⠁"],
      [Consonant.ㄔ, "⠃"],
      [Consonant.ㄕ, "⠊"],
      [Consonant.ㄖ, "⠛"],
      [Consonant.ㄗ, "⠓"],
      [Consonant.ㄘ, "⠚"],
      [Consonant.ㄙ, "⠑"],
    ]);

    export const allBpmf: string[] = Array.from(map.keys());
    export const allBraille: string[] = Array.from(map.values());

    export function fromBpmf(b: string): Consonant | undefined {
      if (map.has(b as Consonant)) {
        return b as Consonant;
      }
      return undefined;
    }
    export function fromBraille(b: string): Consonant | undefined {
      for (let [key, value] of map) {
        if (value === b) {
          return key;
        }
      }
      return undefined;
    }
    export function toBpmf(c: Consonant): string {
      return c;
    }
    export function toBraille(c: Consonant): string {
      return map.get(c) as string;
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

  enum MiddleVowel {
    ㄧ = "ㄧ",
    ㄨ = "ㄨ",
    ㄩ = "ㄩ",
  }

  namespace MiddleVowel {
    const map = new Map<MiddleVowel, string>([
      [MiddleVowel.ㄧ, "⠡"],
      [MiddleVowel.ㄨ, "⠌"],
      [MiddleVowel.ㄩ, "⠳"],
    ]);

    export const allBpmf: string[] = Array.from(map.keys());
    export const allBraille: string[] = Array.from(map.values());
    export function fromBpmf(b: string): MiddleVowel | undefined {
      if (map.has(b as MiddleVowel)) {
        return b as MiddleVowel;
      }
      return undefined;
    }
    export function fromBraille(b: string): MiddleVowel | undefined {
      for (let [key, value] of map) {
        if (value === b) {
          return key;
        }
      }
      return undefined;
    }
    export function toBpmf(c: MiddleVowel): string {
      return c;
    }
    export function toBraille(c: MiddleVowel): string {
      return map.get(c) as string;
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
    const map = new Map<Vowel, string>([
      [Vowel.ㄚ, "⠜"],
      [Vowel.ㄛ, "⠣"],
      [Vowel.ㄜ, "⠮"],
      [Vowel.ㄝ, "⠢"],
      [Vowel.ㄞ, "⠺"],
      [Vowel.ㄟ, "⠴"],
      [Vowel.ㄠ, "⠩"],
      [Vowel.ㄡ, "⠷"],
      [Vowel.ㄢ, "⠧"],
      [Vowel.ㄣ, "⠥"],
      [Vowel.ㄤ, "⠭"],
      [Vowel.ㄥ, "⠵"],
      [Vowel.ㄦ, "⠱"],
    ]);

    export const allBpmf: string[] = Array.from(map.keys());
    export const allBraille: string[] = Array.from(map.values());
    export function fromBpmf(b: string): Vowel | undefined {
      if (map.has(b as Vowel)) {
        return b as Vowel;
      }
      return undefined;
    }
    export function fromBraille(b: string): Vowel | undefined {
      for (let [key, value] of map) {
        if (value === b) {
          return key;
        }
      }
      return undefined;
    }
    export function toBpmf(c: Vowel): string {
      return c;
    }
    export function toBraille(c: Vowel): string {
      return map.get(c) as string;
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
    const map = new Map<ㄧ_Combination, string>([
      [ㄧ_Combination.ㄧㄚ, "⠾"],
      [ㄧ_Combination.ㄧㄛ, "⠴"],
      [ㄧ_Combination.ㄧㄝ, "⠬"],
      [ㄧ_Combination.ㄧㄞ, "⠢"],
      [ㄧ_Combination.ㄧㄠ, "⠪"],
      [ㄧ_Combination.ㄧㄡ, "⠎"],
      [ㄧ_Combination.ㄧㄢ, "⠞"],
      [ㄧ_Combination.ㄧㄣ, "⠹"],
      [ㄧ_Combination.ㄧㄤ, "⠨"],
      [ㄧ_Combination.ㄧㄥ, "⠽"],
    ]);

    export const allBpmf: string[] = Array.from(map.keys());
    export const allBraille: string[] = Array.from(map.values());
    export function fromBpmf(b: string): ㄧ_Combination | undefined {
      b = "ㄧ" + b;
      if (map.has(b as ㄧ_Combination)) {
        return b as ㄧ_Combination;
      }
      return undefined;
    }
    export function fromBraille(b: string): ㄧ_Combination | undefined {
      for (let [key, value] of map) {
        if (value === b) {
          return key;
        }
      }
      return undefined;
    }
    export function toBpmf(c: ㄧ_Combination): string {
      return c;
    }
    export function toBraille(c: ㄧ_Combination): string {
      return map.get(c) as string;
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
    const map = new Map<ㄨ_Combination, string>([
      [ㄨ_Combination.ㄨㄚ, "⠔"],
      [ㄨ_Combination.ㄨㄛ, "⠒"],
      [ㄨ_Combination.ㄨㄞ, "⠶"],
      [ㄨ_Combination.ㄨㄟ, "⠫"],
      [ㄨ_Combination.ㄨㄢ, "⠻"],
      [ㄨ_Combination.ㄨㄣ, "⠿"],
      [ㄨ_Combination.ㄨㄤ, "⠸"],
      [ㄨ_Combination.ㄨㄥ, "⠯"],
    ]);

    export const allBpmf: string[] = Array.from(map.keys());
    export const allBraille: string[] = Array.from(map.values());
    export function fromBpmf(b: string): ㄨ_Combination | undefined {
      b = "ㄨ" + b;
      if (map.has(b as ㄨ_Combination)) {
        return b as ㄨ_Combination;
      }
      return undefined;
    }
    export function fromBraille(b: string): ㄨ_Combination | undefined {
      for (let [key, value] of map) {
        if (value === b) {
          return key;
        }
      }
      return undefined;
    }
    export function toBpmf(c: ㄨ_Combination): string {
      return c;
    }
    export function toBraille(c: ㄨ_Combination): string {
      return map.get(c) as string;
    }
  }

  enum ㄩ_Combination {
    ㄩㄝ = "ㄩㄝ",
    ㄩㄢ = "ㄩㄢ",
    ㄩㄣ = "ㄩㄣ",
    ㄩㄥ = "ㄩㄥ",
  }
  namespace ㄩ_Combination {
    const map = new Map<ㄩ_Combination, string>([
      [ㄩ_Combination.ㄩㄝ, "⠦"],
      [ㄩ_Combination.ㄩㄢ, "⠘"],
      [ㄩ_Combination.ㄩㄣ, "⠲"],
      [ㄩ_Combination.ㄩㄥ, "⠖"],
    ]);

    export const allBpmf: string[] = Array.from(map.keys());
    export const allBraille: string[] = Array.from(map.values());
    export function fromBpmf(b: string): ㄩ_Combination | undefined {
      b = "ㄩ" + b;
      if (map.has(b as ㄩ_Combination)) {
        return b as ㄩ_Combination;
      }
      return undefined;
    }
    export function fromBraille(b: string): ㄩ_Combination | undefined {
      for (let [key, value] of map) {
        if (value === b) {
          return key;
        }
      }
      return undefined;
    }
    export function toBpmf(c: ㄩ_Combination): string {
      return c;
    }
    export function toBraille(c: ㄩ_Combination): string {
      return map.get(c) as string;
    }
  }

  enum Tone {
    tone1 = "",
    tone2 = "ˊ",
    tone3 = "ˇ",
    tone4 = "ˋ",
    tone5 = "˙",
  }

  namespace Tone {
    const map = new Map<Tone, string>([
      [Tone.tone1, "⠄"],
      [Tone.tone2, "⠂"],
      [Tone.tone3, "⠈"],
      [Tone.tone4, "⠐"],
      [Tone.tone5, "⠁"],
    ]);

    export const allBpmf: string[] = Array.from(map.keys());
    export const allBraille: string[] = Array.from(map.values());
    export function fromBpmf(b: string): Tone | undefined {
      if (map.has(b as Tone)) {
        return b as Tone;
      }
      return undefined;
    }
    export function fromBraille(b: string): Tone | undefined {
      for (let [key, value] of map) {
        if (value === b) {
          return key;
        }
      }
      return undefined;
    }
    export function toBpmf(c: Tone): string {
      return c;
    }
    export function toBraille(c: Tone): string {
      return map.get(c) as string;
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
            if (Consonant.isSingle(consonant)) {
              throw new Error("Invalid Braille: other");
            }
          }
        } else if (c === "⠁") {
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
        }
      }

      if (tone == undefined) {
        throw new Error("Invalid Braille: no tone");
      }

      let bpmf = BopomofoSyllable.makeBpmf(consonant, middleVowel, vowel, tone);
      return new BopomofoSyllable(bpmf, braille);
    }
  }
}
