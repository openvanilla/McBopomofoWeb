/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import {
  BopomofoKeyboardLayout,
  BopomofoKeyToComponentMap,
  BopomofoSyllable,
} from "./index";

// import { BopomofoSyllable } from "./BopomofoSyllable";

describe("BopomofoKeyboardLayout", () => {
  describe("Static Layout Instances", () => {
    test("StandardLayout should be accessible", () => {
      const layout = BopomofoKeyboardLayout.StandardLayout;
      expect(layout).toBeDefined();
      expect(layout.name).toBe("Standard");
    });

    test("IBMLayout should be accessible", () => {
      const layout = BopomofoKeyboardLayout.IBMLayout;
      expect(layout).toBeDefined();
      expect(layout.name).toBe("IBM");
    });

    test("ETenLayout should be accessible", () => {
      const layout = BopomofoKeyboardLayout.ETenLayout;
      expect(layout).toBeDefined();
      expect(layout.name).toBe("ETen");
    });

    test("HsuLayout should be accessible", () => {
      const layout = BopomofoKeyboardLayout.HsuLayout;
      expect(layout).toBeDefined();
      expect(layout.name).toBe("Hsu");
    });

    test("ETen26Layout should be accessible", () => {
      const layout = BopomofoKeyboardLayout.ETen26Layout;
      expect(layout).toBeDefined();
      expect(layout.name).toBe("ETen26");
    });

    test("HanyuPinyinLayout should be accessible", () => {
      const layout = BopomofoKeyboardLayout.HanyuPinyinLayout;
      expect(layout).toBeDefined();
      expect(layout.name).toBe("HanyuPinyin");
    });

    test("All static layouts should return the same instance", () => {
      const layout1 = BopomofoKeyboardLayout.StandardLayout;
      const layout2 = BopomofoKeyboardLayout.StandardLayout;
      expect(layout1).toBe(layout2);
    });
  });

  describe("Constructor and Basic Properties", () => {
    test("Constructor should create layout with given name", () => {
      const ktcm: BopomofoKeyToComponentMap = new Map([
        ["a", [BopomofoSyllable.B]],
        ["b", [BopomofoSyllable.P]],
      ]);
      const layout = new BopomofoKeyboardLayout(ktcm, "TestLayout");
      expect(layout.name).toBe("TestLayout");
    });

    test("Constructor should build reverse component-to-key mapping", () => {
      const ktcm: BopomofoKeyToComponentMap = new Map([
        ["a", [BopomofoSyllable.B]],
        ["b", [BopomofoSyllable.P, BopomofoSyllable.M]],
      ]);
      const layout = new BopomofoKeyboardLayout(ktcm, "TestLayout");

      expect(layout.componentToKey(BopomofoSyllable.B)).toBe("a");
      expect(layout.componentToKey(BopomofoSyllable.P)).toBe("b");
      expect(layout.componentToKey(BopomofoSyllable.M)).toBe("b");
    });
  });

  describe("componentToKey method", () => {
    const layout = BopomofoKeyboardLayout.StandardLayout;

    test("Should return correct key for valid components", () => {
      expect(layout.componentToKey(BopomofoSyllable.B)).toBe("1");
      expect(layout.componentToKey(BopomofoSyllable.P)).toBe("q");
      expect(layout.componentToKey(BopomofoSyllable.M)).toBe("a");
      expect(layout.componentToKey(BopomofoSyllable.F)).toBe("z");
      expect(layout.componentToKey(BopomofoSyllable.Tone2)).toBe("6");
      expect(layout.componentToKey(BopomofoSyllable.Tone3)).toBe("3");
      expect(layout.componentToKey(BopomofoSyllable.Tone4)).toBe("4");
      expect(layout.componentToKey(BopomofoSyllable.Tone5)).toBe("7");
    });

    test("Should return empty string for invalid components", () => {
      expect(layout.componentToKey(0x9999)).toBe("");
      expect(layout.componentToKey(-1)).toBe("");
    });
  });

  describe("keyToComponents method", () => {
    const layout = BopomofoKeyboardLayout.StandardLayout;

    test("Should return correct components for valid keys", () => {
      expect(layout.keyToComponents("1")).toEqual([BopomofoSyllable.B]);
      expect(layout.keyToComponents("q")).toEqual([BopomofoSyllable.P]);
      expect(layout.keyToComponents("a")).toEqual([BopomofoSyllable.M]);
      expect(layout.keyToComponents("z")).toEqual([BopomofoSyllable.F]);
      expect(layout.keyToComponents("6")).toEqual([BopomofoSyllable.Tone2]);
    });

    test("Should return empty array for invalid keys", () => {
      expect(layout.keyToComponents("invalid")).toEqual([]);
      expect(layout.keyToComponents("")).toEqual([]);
      expect(layout.keyToComponents("123")).toEqual([]);
    });
  });

  describe("Standard Layout Key Mappings", () => {
    const layout = BopomofoKeyboardLayout.StandardLayout;

    test("Consonants should map correctly", () => {
      const consonantMappings: [string, number][] = [
        ["1", BopomofoSyllable.B],
        ["q", BopomofoSyllable.P],
        ["a", BopomofoSyllable.M],
        ["z", BopomofoSyllable.F],
        ["2", BopomofoSyllable.D],
        ["w", BopomofoSyllable.T],
        ["s", BopomofoSyllable.N],
        ["x", BopomofoSyllable.L],
        ["e", BopomofoSyllable.G],
        ["d", BopomofoSyllable.K],
        ["c", BopomofoSyllable.H],
        ["r", BopomofoSyllable.J],
        ["f", BopomofoSyllable.Q],
        ["v", BopomofoSyllable.X],
        ["5", BopomofoSyllable.ZH],
        ["t", BopomofoSyllable.CH],
        ["g", BopomofoSyllable.SH],
        ["b", BopomofoSyllable.R],
        ["y", BopomofoSyllable.Z],
        ["h", BopomofoSyllable.C],
        ["n", BopomofoSyllable.S],
      ];

      consonantMappings.forEach(([key, component]) => {
        expect(layout.keyToComponents(key)).toEqual([component]);
        expect(layout.componentToKey(component)).toBe(key);
      });
    });

    test("Vowels should map correctly", () => {
      const vowelMappings: [string, number][] = [
        ["u", BopomofoSyllable.I],
        ["j", BopomofoSyllable.U],
        ["m", BopomofoSyllable.UE],
        ["8", BopomofoSyllable.A],
        ["i", BopomofoSyllable.O],
        ["k", BopomofoSyllable.ER],
        [",", BopomofoSyllable.E],
        ["9", BopomofoSyllable.AI],
        ["o", BopomofoSyllable.EI],
        ["l", BopomofoSyllable.AO],
        [".", BopomofoSyllable.OU],
        ["0", BopomofoSyllable.AN],
        ["p", BopomofoSyllable.EN],
        [";", BopomofoSyllable.ANG],
        ["/", BopomofoSyllable.ENG],
        ["-", BopomofoSyllable.ERR],
      ];

      vowelMappings.forEach(([key, component]) => {
        expect(layout.keyToComponents(key)).toEqual([component]);
        expect(layout.componentToKey(component)).toBe(key);
      });
    });

    test("Tones should map correctly", () => {
      const toneMappings: [string, number][] = [
        ["3", BopomofoSyllable.Tone3],
        ["4", BopomofoSyllable.Tone4],
        ["6", BopomofoSyllable.Tone2],
        ["7", BopomofoSyllable.Tone5],
      ];

      toneMappings.forEach(([key, component]) => {
        expect(layout.keyToComponents(key)).toEqual([component]);
        expect(layout.componentToKey(component)).toBe(key);
      });
    });
  });

  describe("Hsu Layout Multiple Components", () => {
    const layout = BopomofoKeyboardLayout.HsuLayout;

    test("Keys with multiple components should work correctly", () => {
      // "m" key maps to both M consonant and AN final
      expect(layout.keyToComponents("m")).toEqual([
        BopomofoSyllable.M,
        BopomofoSyllable.AN,
      ]);

      // "l" key maps to L consonant, ENG final, and ERR
      expect(layout.keyToComponents("l")).toEqual([
        BopomofoSyllable.L,
        BopomofoSyllable.ENG,
        BopomofoSyllable.ERR,
      ]);

      // "j" key maps to J consonant, ZH consonant, and Tone4
      expect(layout.keyToComponents("j")).toEqual([
        BopomofoSyllable.J,
        BopomofoSyllable.ZH,
        BopomofoSyllable.Tone4,
      ]);
    });

    test("Component to key mapping should use first key found", () => {
      // Since multiple keys can map to the same component,
      // componentToKey should return one of them consistently
      expect(layout.componentToKey(BopomofoSyllable.M)).toBe("m");
      expect(layout.componentToKey(BopomofoSyllable.AN)).toBe("m");
    });
  });

  describe("keySequenceFromSyllable method", () => {
    const standardLayout = BopomofoKeyboardLayout.StandardLayout;

    test("Should convert simple syllable to key sequence", () => {
      const syllable = new BopomofoSyllable(
        BopomofoSyllable.B | BopomofoSyllable.A
      );
      expect(standardLayout.keySequenceFromSyllable(syllable)).toBe("18");
    });

    test("Should convert syllable with tone to key sequence", () => {
      const syllable = new BopomofoSyllable(
        BopomofoSyllable.B | BopomofoSyllable.A | BopomofoSyllable.Tone2
      );
      expect(standardLayout.keySequenceFromSyllable(syllable)).toBe("186");
    });

    test("Should convert complex syllable to key sequence", () => {
      const syllable = new BopomofoSyllable(
        BopomofoSyllable.ZH |
          BopomofoSyllable.U |
          BopomofoSyllable.ANG |
          BopomofoSyllable.Tone3
      );
      expect(standardLayout.keySequenceFromSyllable(syllable)).toBe("5j;3");
    });

    test("Should handle empty syllable", () => {
      const syllable = new BopomofoSyllable(0);
      expect(standardLayout.keySequenceFromSyllable(syllable)).toBe("");
    });
  });

  describe("syllableFromKeySequence method", () => {
    const standardLayout = BopomofoKeyboardLayout.StandardLayout;

    test("Should convert simple key sequence to syllable", () => {
      const syllable = standardLayout.syllableFromKeySequence("18");
      expect(syllable.consonantComponent).toBe(BopomofoSyllable.B);
      expect(syllable.vowelComponent).toBe(BopomofoSyllable.A);
    });

    test("Should convert key sequence with tone to syllable", () => {
      const syllable = standardLayout.syllableFromKeySequence("186");
      expect(syllable.consonantComponent).toBe(BopomofoSyllable.B);
      expect(syllable.vowelComponent).toBe(BopomofoSyllable.A);
      expect(syllable.toneMarkerComponent).toBe(BopomofoSyllable.Tone2);
    });

    test("Should handle empty sequence", () => {
      const syllable = standardLayout.syllableFromKeySequence("");
      expect(syllable.isEmpty).toBe(true);
    });

    test("Should handle invalid keys in sequence", () => {
      const syllable = standardLayout.syllableFromKeySequence("1x8");
      expect(syllable.consonantComponent).toBe(8);
      expect(syllable.vowelComponent).toBe(BopomofoSyllable.A);
    });
  });

  describe("Layout-specific behavior", () => {
    test("Hsu layout should handle special G->J conversion", () => {
      const layout = BopomofoKeyboardLayout.HsuLayout;

      // GI should become JI
      const syllable1 = layout.syllableFromKeySequence("ge"); // G + I
      expect(syllable1.consonantComponent).toBe(BopomofoSyllable.J);
      expect(syllable1.middleVowelComponent).toBe(BopomofoSyllable.I);

      // GUE should become JUE
      const syllable2 = layout.syllableFromKeySequence("gu"); // G + UE
      expect(syllable2.consonantComponent).toBe(BopomofoSyllable.J);
      expect(syllable2.middleVowelComponent).toBe(BopomofoSyllable.UE);
    });

    test("Hsu layout should handle L->ERR conversion when appropriate", () => {
      const layout = BopomofoKeyboardLayout.HsuLayout;

      // L alone with ENG sound should become ERR
      const syllable = layout.syllableFromKeySequence("l");
      expect(syllable.vowelComponent).toBe(BopomofoSyllable.ERR);
    });
  });

  describe("Edge cases", () => {
    test("Should handle syllable with all components", () => {
      const layout = BopomofoKeyboardLayout.StandardLayout;
      const syllable = new BopomofoSyllable(
        BopomofoSyllable.ZH |
          BopomofoSyllable.U |
          BopomofoSyllable.ANG |
          BopomofoSyllable.Tone3
      );

      const keySequence = layout.keySequenceFromSyllable(syllable);
      expect(keySequence).toBe("5j;3");

      const reconstructed = layout.syllableFromKeySequence(keySequence);
      expect(reconstructed.consonantComponent).toBe(BopomofoSyllable.ZH);
      expect(reconstructed.middleVowelComponent).toBe(BopomofoSyllable.U);
      expect(reconstructed.vowelComponent).toBe(BopomofoSyllable.ANG);
      expect(reconstructed.toneMarkerComponent).toBe(BopomofoSyllable.Tone3);
    });

    test("Should handle tone1 (which is 0x0000)", () => {
      const layout = BopomofoKeyboardLayout.StandardLayout;
      const syllable = new BopomofoSyllable(
        BopomofoSyllable.B | BopomofoSyllable.A | BopomofoSyllable.Tone1
      );

      const keySequence = layout.keySequenceFromSyllable(syllable);
      expect(keySequence).toBe("18"); // Tone1 should not add any character

      const reconstructed = layout.syllableFromKeySequence(keySequence);
      expect(reconstructed.toneMarkerComponent).toBe(BopomofoSyllable.Tone1);
    });
  });

  describe("Different layouts comparison", () => {
    test("Same syllable should produce different key sequences for different layouts", () => {
      const syllable = new BopomofoSyllable(
        BopomofoSyllable.B | BopomofoSyllable.A | BopomofoSyllable.Tone2
      );

      const standardSeq =
        BopomofoKeyboardLayout.StandardLayout.keySequenceFromSyllable(syllable);
      const ibmSeq =
        BopomofoKeyboardLayout.IBMLayout.keySequenceFromSyllable(syllable);
      const etenSeq =
        BopomofoKeyboardLayout.ETenLayout.keySequenceFromSyllable(syllable);

      expect(standardSeq).toBe("186");
      expect(ibmSeq).toBe("1fm");
      expect(etenSeq).toBe("ba2");

      // All should be different
      expect(standardSeq).not.toBe(ibmSeq);
      expect(standardSeq).not.toBe(etenSeq);
      expect(ibmSeq).not.toBe(etenSeq);
    });

    test("Each layout should be able to reconstruct its own syllables", () => {
      const layouts = [
        BopomofoKeyboardLayout.StandardLayout,
        BopomofoKeyboardLayout.IBMLayout,
        BopomofoKeyboardLayout.ETenLayout,
      ];

      const syllable = new BopomofoSyllable(
        BopomofoSyllable.M | BopomofoSyllable.A | BopomofoSyllable.Tone3
      );

      layouts.forEach((layout) => {
        const keySequence = layout.keySequenceFromSyllable(syllable);
        const reconstructed = layout.syllableFromKeySequence(keySequence);

        expect(reconstructed.consonantComponent).toBe(
          syllable.consonantComponent
        );
        expect(reconstructed.vowelComponent).toBe(syllable.vowelComponent);
        expect(reconstructed.toneMarkerComponent).toBe(
          syllable.toneMarkerComponent
        );
      });
    });
  });
});
