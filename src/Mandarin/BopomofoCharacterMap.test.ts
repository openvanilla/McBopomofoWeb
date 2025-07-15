/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BopomofoCharacterMap } from "./BopomofoCharacterMap";
import { BopomofoSyllable } from "./BopomofoSyllable";

describe("BopomofoCharacterMap", () => {
  let characterMap: BopomofoCharacterMap;

  beforeEach(() => {
    characterMap = new BopomofoCharacterMap();
  });

  describe("Constructor and Instance Creation", () => {
    test("should create a new instance with proper initialization", () => {
      expect(characterMap).toBeInstanceOf(BopomofoCharacterMap);
      expect(characterMap.characterToComponent).toBeInstanceOf(Map);
      expect(characterMap.componentToCharacter).toBeInstanceOf(Map);
    });

    test("should have shared instance available", () => {
      expect(BopomofoCharacterMap.sharedInstance).toBeInstanceOf(
        BopomofoCharacterMap
      );
    });

    test("should have same shared instance across calls", () => {
      const instance1 = BopomofoCharacterMap.sharedInstance;
      const instance2 = BopomofoCharacterMap.sharedInstance;
      expect(instance1).toBe(instance2);
    });
  });

  describe("Character to Component Mapping", () => {
    test("should map consonants correctly", () => {
      const consonantMappings: [string, number][] = [
        ["ㄅ", BopomofoSyllable.B],
        ["ㄆ", BopomofoSyllable.P],
        ["ㄇ", BopomofoSyllable.M],
        ["ㄈ", BopomofoSyllable.F],
        ["ㄉ", BopomofoSyllable.D],
        ["ㄊ", BopomofoSyllable.T],
        ["ㄋ", BopomofoSyllable.N],
        ["ㄌ", BopomofoSyllable.L],
        ["ㄎ", BopomofoSyllable.K],
        ["ㄍ", BopomofoSyllable.G],
        ["ㄏ", BopomofoSyllable.H],
        ["ㄐ", BopomofoSyllable.J],
        ["ㄑ", BopomofoSyllable.Q],
        ["ㄒ", BopomofoSyllable.X],
        ["ㄓ", BopomofoSyllable.ZH],
        ["ㄔ", BopomofoSyllable.CH],
        ["ㄕ", BopomofoSyllable.SH],
        ["ㄖ", BopomofoSyllable.R],
        ["ㄗ", BopomofoSyllable.Z],
        ["ㄘ", BopomofoSyllable.C],
        ["ㄙ", BopomofoSyllable.S],
      ];

      consonantMappings.forEach(([character, expectedComponent]) => {
        expect(characterMap.characterToComponent.get(character)).toBe(
          expectedComponent
        );
      });
    });

    test("should map middle vowels correctly", () => {
      const middleVowelMappings: [string, number][] = [
        ["ㄧ", BopomofoSyllable.I],
        ["ㄨ", BopomofoSyllable.U],
        ["ㄩ", BopomofoSyllable.UE],
      ];

      middleVowelMappings.forEach(([character, expectedComponent]) => {
        expect(characterMap.characterToComponent.get(character)).toBe(
          expectedComponent
        );
      });
    });

    test("should map vowels correctly", () => {
      const vowelMappings: [string, number][] = [
        ["ㄚ", BopomofoSyllable.A],
        ["ㄛ", BopomofoSyllable.O],
        ["ㄜ", BopomofoSyllable.ER],
        ["ㄝ", BopomofoSyllable.E],
        ["ㄞ", BopomofoSyllable.AI],
        ["ㄟ", BopomofoSyllable.EI],
        ["ㄠ", BopomofoSyllable.AO],
        ["ㄡ", BopomofoSyllable.OU],
        ["ㄢ", BopomofoSyllable.AN],
        ["ㄣ", BopomofoSyllable.EN],
        ["ㄤ", BopomofoSyllable.ANG],
        ["ㄥ", BopomofoSyllable.ENG],
        ["ㄦ", BopomofoSyllable.ERR],
      ];

      vowelMappings.forEach(([character, expectedComponent]) => {
        expect(characterMap.characterToComponent.get(character)).toBe(
          expectedComponent
        );
      });
    });

    test("should map tone markers correctly", () => {
      const toneMappings: [string, number][] = [
        ["ˊ", BopomofoSyllable.Tone2],
        ["ˇ", BopomofoSyllable.Tone3],
        ["ˋ", BopomofoSyllable.Tone4],
        ["˙", BopomofoSyllable.Tone5],
      ];

      toneMappings.forEach(([character, expectedComponent]) => {
        expect(characterMap.characterToComponent.get(character)).toBe(
          expectedComponent
        );
      });
    });

    test("should return undefined for non-existent characters", () => {
      expect(characterMap.characterToComponent.get("a")).toBeUndefined();
      expect(characterMap.characterToComponent.get("中")).toBeUndefined();
      expect(characterMap.characterToComponent.get("1")).toBeUndefined();
      expect(characterMap.characterToComponent.get("")).toBeUndefined();
    });
  });

  describe("Component to Character Mapping", () => {
    test("should map components back to characters correctly", () => {
      const testMappings: [number, string][] = [
        [BopomofoSyllable.B, "ㄅ"],
        [BopomofoSyllable.P, "ㄆ"],
        [BopomofoSyllable.M, "ㄇ"],
        [BopomofoSyllable.I, "ㄧ"],
        [BopomofoSyllable.U, "ㄨ"],
        [BopomofoSyllable.UE, "ㄩ"],
        [BopomofoSyllable.A, "ㄚ"],
        [BopomofoSyllable.O, "ㄛ"],
        [BopomofoSyllable.Tone2, "ˊ"],
        [BopomofoSyllable.Tone3, "ˇ"],
        [BopomofoSyllable.Tone4, "ˋ"],
        [BopomofoSyllable.Tone5, "˙"],
      ];

      testMappings.forEach(([component, expectedCharacter]) => {
        expect(characterMap.componentToCharacter.get(component)).toBe(
          expectedCharacter
        );
      });
    });

    test("should return undefined for non-existent components", () => {
      expect(characterMap.componentToCharacter.get(0x9999)).toBeUndefined();
      expect(characterMap.componentToCharacter.get(-1)).toBeUndefined();
      expect(characterMap.componentToCharacter.get(0)).toBeUndefined();
    });
  });

  describe("Bidirectional Mapping Consistency", () => {
    test("should have consistent bidirectional mapping for all entries", () => {
      // Test that every character->component mapping has a corresponding component->character mapping
      characterMap.characterToComponent.forEach((component, character) => {
        expect(characterMap.componentToCharacter.get(component)).toBe(
          character
        );
      });

      // Test that every component->character mapping has a corresponding character->component mapping
      characterMap.componentToCharacter.forEach((character, component) => {
        expect(characterMap.characterToComponent.get(character)).toBe(
          component
        );
      });
    });

    test("should have same number of entries in both maps", () => {
      expect(characterMap.characterToComponent.size).toBe(
        characterMap.componentToCharacter.size
      );
    });
  });

  describe("Map Size and Coverage", () => {
    test("should have expected number of total mappings", () => {
      // 21 consonants + 3 middle vowels + 13 vowels + 4 tone markers = 41 total
      expect(characterMap.characterToComponent.size).toBe(41);
      expect(characterMap.componentToCharacter.size).toBe(41);
    });

    test("should contain all required Bopomofo characters", () => {
      const requiredCharacters = [
        // Consonants
        "ㄅ",
        "ㄆ",
        "ㄇ",
        "ㄈ",
        "ㄉ",
        "ㄊ",
        "ㄋ",
        "ㄌ",
        "ㄎ",
        "ㄍ",
        "ㄏ",
        "ㄐ",
        "ㄑ",
        "ㄒ",
        "ㄓ",
        "ㄔ",
        "ㄕ",
        "ㄖ",
        "ㄗ",
        "ㄘ",
        "ㄙ",
        // Middle vowels
        "ㄧ",
        "ㄨ",
        "ㄩ",
        // Vowels
        "ㄚ",
        "ㄛ",
        "ㄜ",
        "ㄝ",
        "ㄞ",
        "ㄟ",
        "ㄠ",
        "ㄡ",
        "ㄢ",
        "ㄣ",
        "ㄤ",
        "ㄥ",
        "ㄦ",
        // Tone markers
        "ˊ",
        "ˇ",
        "ˋ",
        "˙",
      ];

      requiredCharacters.forEach((character) => {
        expect(characterMap.characterToComponent.has(character)).toBe(true);
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty string lookups gracefully", () => {
      expect(characterMap.characterToComponent.get("")).toBeUndefined();
    });

    test("should handle null/undefined lookups gracefully", () => {
      expect(
        characterMap.characterToComponent.get(null as any)
      ).toBeUndefined();
      expect(
        characterMap.characterToComponent.get(undefined as any)
      ).toBeUndefined();
      expect(
        characterMap.componentToCharacter.get(null as any)
      ).toBeUndefined();
      expect(
        characterMap.componentToCharacter.get(undefined as any)
      ).toBeUndefined();
    });

    test("should handle multi-character strings by only considering first character", () => {
      // Since Map.get() does exact key matching, "ㄅㄆ" won't match "ㄅ"
      expect(characterMap.characterToComponent.get("ㄅㄆ")).toBeUndefined();
    });
  });

  describe("Immutability", () => {
    test("should return the same Map instances on multiple calls", () => {
      const charToComp1 = characterMap.characterToComponent;
      const charToComp2 = characterMap.characterToComponent;
      const compToChar1 = characterMap.componentToCharacter;
      const compToChar2 = characterMap.componentToCharacter;

      expect(charToComp1).toBe(charToComp2);
      expect(compToChar1).toBe(compToChar2);
    });
  });
});
