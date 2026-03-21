/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BopomofoSyllable } from "./index";

describe("Test Pinyin", () => {
  test("Test basic pinyin conversion", () => {
    const testCases = [
      ["ba1", "ㄅㄚ"],
      ["po2", "ㄆㄛˊ"],
      ["me3", "ㄇㄜˇ"],
      ["fo4", "ㄈㄛˋ"],
      ["de5", "ㄉㄜ˙"],
      ["ti1", "ㄊㄧ"],
      ["nu2", "ㄋㄨˊ"],
      ["lu3", "ㄌㄨˇ"],
      ["ge4", "ㄍㄜˋ"],
      ["ke5", "ㄎㄜ˙"],
      ["he1", "ㄏㄜ"],
      ["ji2", "ㄐㄧˊ"],
      ["qi3", "ㄑㄧˇ"],
      ["xi4", "ㄒㄧˋ"],
      ["zhi1", "ㄓ"],
      ["chi2", "ㄔˊ"],
      ["shi3", "ㄕˇ"],
      ["ri4", "ㄖˋ"],
      ["zi5", "ㄗ˙"],
      ["ci1", "ㄘ"],
      ["si2", "ㄙˊ"],
    ];

    testCases.forEach(([pinyin, expected]) => {
      const result = BopomofoSyllable.FromHanyuPinyin(pinyin);
      expect(result.composedString).toBe(expected);
    });
  });

  test("Test compound vowels", () => {
    const testCases = [
      ["lian2", "ㄌㄧㄢˊ"],
      ["yuan4", "ㄩㄢˋ"],
      ["huang1", "ㄏㄨㄤ"],
      ["jue2", "ㄐㄩㄝˊ"],
      ["qiong2", "ㄑㄩㄥˊ"],
      ["xiong", "ㄒㄩㄥ"],
      ["yuan1", "ㄩㄢ"],
      ["ying2", "ㄧㄥˊ"],
      ["yung3", "ㄩㄥˇ"],
      ["yong4", "ㄩㄥˋ"],
      ["yue1", "ㄩㄝ"],
      ["yun2", "ㄩㄣˊ"],
      ["you3", "ㄧㄡˇ"],
      ["yu4", "ㄩˋ"],
      ["ying1", "ㄧㄥ"],
      ["yung2", "ㄩㄥˊ"],
      ["yong3", "ㄩㄥˇ"],
      ["yue4", "ㄩㄝˋ"],
      ["yun1", "ㄩㄣ"],
      ["you2", "ㄧㄡˊ"],
      ["yu3", "ㄩˇ"],
      ["veng1", "ㄩㄥ"],
      ["iong2", "ㄩㄥˊ"],
      ["ying3", "ㄧㄥˇ"],
      ["ian4", "ㄧㄢˋ"],
      ["iou1", "ㄧㄡ"],
      ["uen2", "ㄨㄣˊ"],
      ["ven3", "ㄩㄣˇ"],
      ["uei4", "ㄨㄟˋ"],
      ["ung1", "ㄨㄥ"],
      ["ong2", "ㄨㄥˊ"],
      ["fong3", "ㄈㄥˇ"],
      ["fen4", "ㄈㄣˋ"],
      ["jun1", "ㄐㄩㄣ"],
      ["qun2", "ㄑㄩㄣˊ"],
      ["xun3", "ㄒㄩㄣˇ"],
      ["iu4", "ㄧㄡˋ"],
      ["in1", "ㄧㄣ"],
      ["vn2", "ㄩㄣˊ"],
      ["ui3", "ㄨㄟˇ"],
      ["ue4", "ㄩㄝˋ"],
      ["lv1", "ㄌㄩ"],
    ];

    testCases.forEach(([pinyin, expected]) => {
      const result = BopomofoSyllable.FromHanyuPinyin(pinyin);
      expect(result.composedString).toBe(expected);
    });
  });

  test("Test 1", () => {
    const s = "yang4";
    const result = BopomofoSyllable.FromHanyuPinyin(s);
    const string = result.composedString;
    expect(string).toBe("ㄧㄤˋ");
  });

  test("Test absoluteOrder", () => {
    const s = "yang4";
    const result = BopomofoSyllable.FromHanyuPinyin(s);
    expect(result.absoluteOrder).toBe(4686);
    expect(result.absoluteOrderString).toBe("Ik");
  });

  test("Test from absoluteOrder", () => {
    const result = BopomofoSyllable.FromAbsoluteOrderString("Ik");
    expect(result.absoluteOrder).toBe(4686);
    const string = result.composedString;
    expect(string).toBe("ㄧㄤˋ");
  });

  test("Test edge cases for FromHanyuPinyin", () => {
    // Test empty string
    expect(BopomofoSyllable.FromHanyuPinyin("").composedString).toBe("");

    // Test tone marks
    expect(BopomofoSyllable.FromHanyuPinyin("a1").composedString).toBe("ㄚ");
    expect(BopomofoSyllable.FromHanyuPinyin("a2").composedString).toBe("ㄚˊ");
    expect(BopomofoSyllable.FromHanyuPinyin("a3").composedString).toBe("ㄚˇ");
    expect(BopomofoSyllable.FromHanyuPinyin("a4").composedString).toBe("ㄚˋ");
    expect(BopomofoSyllable.FromHanyuPinyin("a5").composedString).toBe("ㄚ˙");

    // Test case insensitivity
    expect(BopomofoSyllable.FromHanyuPinyin("WO3").composedString).toBe(
      "ㄨㄛˇ"
    );
    expect(BopomofoSyllable.FromHanyuPinyin("NI3").composedString).toBe(
      "ㄋㄧˇ"
    );

    // Test without tone number
    expect(BopomofoSyllable.FromHanyuPinyin("hao").composedString).toBe("ㄏㄠ");
  });

  test("Test HanyuPinyinString with includeTone=true", () => {
    const testCases = [
      ["ㄅㄚ", "ba"],
      ["ㄆㄛˊ", "po2"],
      ["ㄇㄜˇ", "me3"],
      ["ㄈㄛˋ", "fo4"],
      ["ㄉㄜ˙", "de5"],
      ["ㄊㄧ", "ti"],
      ["ㄋㄨˊ", "nu2"],
      ["ㄐㄩㄝˊ", "jue2"],
      ["ㄑㄩㄥˊ", "qiong2"],
      ["ㄒㄩㄥ", "xiong"],
      ["ㄓ", "zhi"],
      ["ㄔˊ", "chi2"],
      ["ㄕˇ", "shi3"],
      ["ㄖˋ", "ri4"],
      ["ㄗ˙", "zi5"],
      ["ㄧㄢˋ", "yan4"],
      ["ㄩㄢˇ", "yuan3"],
      ["ㄨㄥˊ", "weng2"],
      ["ㄧㄥˇ", "ying3"],
    ];

    testCases.forEach(([bopomofo, expected]) => {
      const syllable = BopomofoSyllable.FromComposedString(bopomofo);
      const result = syllable.HanyuPinyinString(true, false);
      expect(result).toBe(expected);
    });
  });

  test("Test HanyuPinyinString with includeTone=false", () => {
    const testCases = [
      ["ㄅㄚ", "ba"],
      ["ㄆㄛˊ", "po"],
      ["ㄇㄜˇ", "me"],
      ["ㄈㄛˋ", "fo"],
      ["ㄉㄜ˙", "de"],
      ["ㄐㄩㄝˊ", "jue"],
      ["ㄑㄩㄥˊ", "qiong"],
      ["ㄒㄩㄥ", "xiong"],
    ];

    testCases.forEach(([bopomofo, expected]) => {
      const syllable = BopomofoSyllable.FromComposedString(bopomofo);
      const result = syllable.HanyuPinyinString(false, false);
      expect(result).toBe(expected);
    });
  });

  test("Test HanyuPinyinString with useVForUUmlaut=true", () => {
    const testCases = [
      ["ㄌㄩ", "lv"],
      ["ㄋㄩˊ", "nv2"],
      ["ㄩㄢˇ", "yuan3"],
      ["ㄐㄩㄝˋ", "jue4"],
      ["ㄒㄩ˙", "xu5"],
    ];

    testCases.forEach(([bopomofo, expected]) => {
      const syllable = BopomofoSyllable.FromComposedString(bopomofo);
      const result = syllable.HanyuPinyinString(true, true);
      expect(result).toBe(expected);
    });
  });

  test("Test HanyuPinyinString special cases", () => {
    // Test empty syllable
    const emptySyllable = new BopomofoSyllable();
    expect(emptySyllable.HanyuPinyinString(true, false)).toBe("");

    // Test special combinations
    const testCases = [
      ["ㄧㄥ", "ying"],
      ["ㄨㄥ", "weng"],
      ["ㄧㄡ", "you"],
      ["ㄧㄣ", "yin"],
      ["ㄨㄟ", "wei"],
      ["ㄩㄥ", "yong"],
      ["ㄩㄣ", "yun"],
    ];

    testCases.forEach(([bopomofo, expected]) => {
      const syllable = BopomofoSyllable.FromComposedString(bopomofo);
      const result = syllable.HanyuPinyinString(true, false);
      expect(result).toBe(expected);
    });
  });

  test("Test additional pinyin parsing edge cases", () => {
    // Test "ing" parsing
    expect(BopomofoSyllable.FromHanyuPinyin("bing1").composedString).toBe("ㄅㄧㄥ");
    expect(BopomofoSyllable.FromHanyuPinyin("ding2").composedString).toBe("ㄉㄧㄥˊ");
    
    // Test "ien" parsing (less common)
    expect(BopomofoSyllable.FromHanyuPinyin("bien3").composedString).toBe("ㄅㄧㄣˇ");
    
    // Test "fung" -> "feng" special case
    expect(BopomofoSyllable.FromHanyuPinyin("fung1").composedString).toBe("ㄈㄥ");
    expect(BopomofoSyllable.FromHanyuPinyin("fong2").composedString).toBe("ㄈㄥˊ");
  });

  test("Test consonant-only syllables in HanyuPinyinString", () => {
    // Test consonants that need special handling
    const testCases = [
      ["ㄍ", "g"],
      ["ㄎ", "k"],
      ["ㄏ", "h"],
      ["ㄐ", "ji"],
      ["ㄑ", "qi"],
      ["ㄒ", "xi"],
    ];

    testCases.forEach(([bopomofo, expected]) => {
      const syllable = BopomofoSyllable.FromComposedString(bopomofo);
      const result = syllable.HanyuPinyinString(true, false);
      expect(result).toBe(expected);
    });
  });

  test("Test FromComposedString edge cases", () => {
    // Test empty string
    expect(BopomofoSyllable.FromComposedString("").composedString).toBe("");
    
    // Test valid composed strings
    expect(BopomofoSyllable.FromComposedString("ㄅㄚ").composedString).toBe("ㄅㄚ");
    expect(BopomofoSyllable.FromComposedString("ㄆㄛˊ").composedString).toBe("ㄆㄛˊ");
    
    // Test complex syllables
    expect(BopomofoSyllable.FromComposedString("ㄓㄨㄤˋ").composedString).toBe("ㄓㄨㄤˋ");
  });

  test("Test BopomofoSyllable properties", () => {
    const syllable = BopomofoSyllable.FromHanyuPinyin("zhuang1");
    
    // Test component getters
    expect(syllable.consonantComponent).toBe(BopomofoSyllable.ZH);
    expect(syllable.middleVowelComponent).toBe(BopomofoSyllable.U);
    expect(syllable.vowelComponent).toBe(BopomofoSyllable.ANG);
    expect(syllable.toneMarkerComponent).toBe(BopomofoSyllable.Tone1);
    
    // Test isEmpty
    expect(syllable.isEmpty).toBe(false);
    expect(new BopomofoSyllable().isEmpty).toBe(true);
    
    // Test hasConsonant, hasMiddleVowel, hasVowel, hasToneMarker
    expect(syllable.hasConsonant).toBe(true);
    expect(syllable.hasMiddleVowel).toBe(true);
    expect(syllable.hasVowel).toBe(true);
    expect(syllable.hasToneMarker).toBe(false); // Tone1 is 0
    
    // Test with tone marker
    const syllable2 = BopomofoSyllable.FromHanyuPinyin("zhuang2");
    expect(syllable2.hasToneMarker).toBe(true);
  });

  test("Test special ZCSR class syllables", () => {
    // These need special handling in pinyin conversion
    const testCases = [
      ["ㄓ", "zhi"],
      ["ㄔ", "chi"],
      ["ㄕ", "shi"],
      ["ㄖ", "ri"],
      ["ㄗ", "zi"],
      ["ㄘ", "ci"],
      ["ㄙ", "si"],
    ];

    testCases.forEach(([bopomofo, expected]) => {
      const syllable = BopomofoSyllable.FromComposedString(bopomofo);
      const result = syllable.HanyuPinyinString(true, false);
      expect(result).toBe(expected);
    });
  });

  test("Test maskType and classification properties", () => {
    // Test belongsToJQXClass
    expect(BopomofoSyllable.FromComposedString("ㄐ").belongsToJQXClass).toBe(true);
    expect(BopomofoSyllable.FromComposedString("ㄑ").belongsToJQXClass).toBe(true);
    expect(BopomofoSyllable.FromComposedString("ㄒ").belongsToJQXClass).toBe(true);
    expect(BopomofoSyllable.FromComposedString("ㄅ").belongsToJQXClass).toBe(false);
    
    // Test belongsToZCSRClass
    expect(BopomofoSyllable.FromComposedString("ㄓ").belongsToZCSRClass).toBe(true);
    expect(BopomofoSyllable.FromComposedString("ㄔ").belongsToZCSRClass).toBe(true);
    expect(BopomofoSyllable.FromComposedString("ㄕ").belongsToZCSRClass).toBe(true);
    expect(BopomofoSyllable.FromComposedString("ㄖ").belongsToZCSRClass).toBe(true);
    expect(BopomofoSyllable.FromComposedString("ㄗ").belongsToZCSRClass).toBe(true);
    expect(BopomofoSyllable.FromComposedString("ㄘ").belongsToZCSRClass).toBe(true);
    expect(BopomofoSyllable.FromComposedString("ㄙ").belongsToZCSRClass).toBe(true);
    expect(BopomofoSyllable.FromComposedString("ㄅ").belongsToZCSRClass).toBe(false);
  });

  test("Test addEqual method", () => {
    const syllable1 = new BopomofoSyllable(BopomofoSyllable.B);
    const syllable2 = new BopomofoSyllable(BopomofoSyllable.A);
    
    syllable1.addEqual(syllable2);
    
    expect(syllable1.consonantComponent).toBe(BopomofoSyllable.B);
    expect(syllable1.vowelComponent).toBe(BopomofoSyllable.A);
  });
});

describe("Test FromHanyuPinyin additional edge cases", () => {
  test("un with non-JQX consonant gives U middle vowel (line 232)", () => {
    expect(BopomofoSyllable.FromHanyuPinyin("lun1").composedString).toBe("ㄌㄨㄣ");
    expect(BopomofoSyllable.FromHanyuPinyin("dun4").composedString).toBe("ㄉㄨㄣˋ");
    expect(BopomofoSyllable.FromHanyuPinyin("tun1").composedString).toBe("ㄊㄨㄣ");
  });

  test("ü (real unicode) gives UE middle vowel (line 251)", () => {
    expect(BopomofoSyllable.FromHanyuPinyin("nü2").composedString).toBe("ㄋㄩˊ");
    expect(BopomofoSyllable.FromHanyuPinyin("lü3").composedString).toBe("ㄌㄩˇ");
  });

  test("J/Q/X + single u gives UE (line 264)", () => {
    expect(BopomofoSyllable.FromHanyuPinyin("ju1").composedString).toBe("ㄐㄩ");
    expect(BopomofoSyllable.FromHanyuPinyin("qu2").composedString).toBe("ㄑㄩˊ");
    expect(BopomofoSyllable.FromHanyuPinyin("xu3").composedString).toBe("ㄒㄩˇ");
  });

  test("eng vowel is parsed correctly (line 277)", () => {
    expect(BopomofoSyllable.FromHanyuPinyin("beng4").composedString).toBe("ㄅㄥˋ");
    expect(BopomofoSyllable.FromHanyuPinyin("peng2").composedString).toBe("ㄆㄥˊ");
  });

  test("err vowel is parsed correctly (line 279)", () => {
    expect(BopomofoSyllable.FromHanyuPinyin("err1").composedString).toBe("ㄦ");
  });

  test("ai vowel is parsed correctly (line 281)", () => {
    expect(BopomofoSyllable.FromHanyuPinyin("bai1").composedString).toBe("ㄅㄞ");
    expect(BopomofoSyllable.FromHanyuPinyin("dai4").composedString).toBe("ㄉㄞˋ");
  });

  test("ei vowel is parsed correctly (line 283)", () => {
    expect(BopomofoSyllable.FromHanyuPinyin("bei2").composedString).toBe("ㄅㄟˊ");
    expect(BopomofoSyllable.FromHanyuPinyin("mei3").composedString).toBe("ㄇㄟˇ");
  });

  test("ou vowel is parsed correctly (line 287)", () => {
    expect(BopomofoSyllable.FromHanyuPinyin("dou4").composedString).toBe("ㄉㄡˋ");
    expect(BopomofoSyllable.FromHanyuPinyin("mou2").composedString).toBe("ㄇㄡˊ");
  });

  test("er vowel is parsed correctly (line 293)", () => {
    expect(BopomofoSyllable.FromHanyuPinyin("er3").composedString).toBe("ㄦˇ");
  });

  test("e after i gives E vowel component (line 300)", () => {
    expect(BopomofoSyllable.FromHanyuPinyin("jie4").composedString).toBe("ㄐㄧㄝˋ");
    expect(BopomofoSyllable.FromHanyuPinyin("lie1").composedString).toBe("ㄌㄧㄝ");
  });
});

describe("Test HanyuPinyinString additional cases", () => {
  test("ANG vowel component produces 'ang' (lines 475-476)", () => {
    expect(BopomofoSyllable.FromComposedString("ㄊㄤ").HanyuPinyinString(true, false)).toBe("tang");
    expect(BopomofoSyllable.FromComposedString("ㄈㄤ").HanyuPinyinString(true, false)).toBe("fang");
  });

  test("ERR vowel component produces 'er' (lines 481-482)", () => {
    expect(BopomofoSyllable.FromComposedString("ㄦ").HanyuPinyinString(true, false)).toBe("er");
    expect(BopomofoSyllable.FromComposedString("ㄦˊ").HanyuPinyinString(true, false)).toBe("er2");
  });

  test("consonant + mvc + EN produces 'n' vowel, not 'en' (line 506)", () => {
    // ㄅㄧㄣ (B + I + EN) → bin
    expect(BopomofoSyllable.FromComposedString("ㄅㄧㄣ").HanyuPinyinString(true, false)).toBe("bin");
    // ㄉㄨㄣ (D + U + EN) → dun
    expect(BopomofoSyllable.FromComposedString("ㄉㄨㄣ").HanyuPinyinString(true, false)).toBe("dun");
  });

  test("no-consonant U + EN produces 'wen' (line 511)", () => {
    expect(BopomofoSyllable.FromComposedString("ㄨㄣ").HanyuPinyinString(true, false)).toBe("wen");
  });

  test("iou → iu rule: consonant + I + OU (lines 520-521)", () => {
    expect(BopomofoSyllable.FromComposedString("ㄌㄧㄡˋ").HanyuPinyinString(true, false)).toBe("liu4");
    expect(BopomofoSyllable.FromComposedString("ㄋㄧㄡ").HanyuPinyinString(true, false)).toBe("niu");
  });

  test("uei → ui rule: consonant + U + EI (lines 532-533)", () => {
    expect(BopomofoSyllable.FromComposedString("ㄉㄨㄟˋ").HanyuPinyinString(true, false)).toBe("dui4");
    expect(BopomofoSyllable.FromComposedString("ㄍㄨㄟ").HanyuPinyinString(true, false)).toBe("gui");
  });
});

describe("Test isOverlappingWith and add methods", () => {
  test("isOverlappingWith returns true for syllables sharing consonant (line 674)", () => {
    const s1 = BopomofoSyllable.FromHanyuPinyin("ba1"); // ㄅ + A
    const s2 = BopomofoSyllable.FromHanyuPinyin("bo2"); // ㄅ + O
    expect(s1.isOverlappingWith(s2)).toBe(true);
  });

  test("isOverlappingWith returns false for non-overlapping syllables (line 678)", () => {
    // Consonant-only syllable vs vowel-only syllable: neither mask region is set in both
    const s1 = new BopomofoSyllable(BopomofoSyllable.B); // consonant only, no vowel, no tone
    const s2 = new BopomofoSyllable(BopomofoSyllable.A); // vowel only, no consonant, no tone
    expect(s1.isOverlappingWith(s2)).toBe(false);
  });

  test("isOverlappingWith returns true for shared middle vowel", () => {
    const s1 = BopomofoSyllable.FromHanyuPinyin("bi1"); // ㄅ + I
    const s2 = BopomofoSyllable.FromHanyuPinyin("di2"); // ㄉ + I
    // Both share middle vowel I → overlapping
    expect(s1.isOverlappingWith(s2)).toBe(true);
  });

  test("add method combines two partial syllables (lines 723-734)", () => {
    const consonant = new BopomofoSyllable(BopomofoSyllable.B);
    const vowel = new BopomofoSyllable(BopomofoSyllable.A);
    const combined = consonant.add(vowel);
    expect(combined.consonantComponent).toBe(BopomofoSyllable.B);
    expect(combined.vowelComponent).toBe(BopomofoSyllable.A);
  });

  test("add method: second syllable's components override first's (lines 730-733)", () => {
    const s1 = BopomofoSyllable.FromHanyuPinyin("ba1"); // ㄅ + A + tone1
    const s2 = BopomofoSyllable.FromHanyuPinyin("po2"); // ㄆ + O + tone2
    const combined = s1.add(s2);
    // s2's consonant (ㄆ), vowel (ㄛ), and tone (2) override s1's
    expect(combined.consonantComponent).toBe(BopomofoSyllable.P);
    expect(combined.vowelComponent).toBe(BopomofoSyllable.O);
  });
});
