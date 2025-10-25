/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BopomofoSyllable } from "./index";

describe("Test Pinyin", () => {
  test("Test basic pinyin conversion", () => {
    let testCases = [
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
      let result = BopomofoSyllable.FromHanyuPinyin(pinyin);
      expect(result.composedString).toBe(expected);
    });
  });

  test("Test compound vowels", () => {
    let testCases = [
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
      let result = BopomofoSyllable.FromHanyuPinyin(pinyin);
      expect(result.composedString).toBe(expected);
    });
  });

  test("Test 1", () => {
    let s = "yang4";
    let result = BopomofoSyllable.FromHanyuPinyin(s);
    let string = result.composedString;
    expect(string).toBe("ㄧㄤˋ");
  });

  test("Test absoluteOrder", () => {
    let s = "yang4";
    let result = BopomofoSyllable.FromHanyuPinyin(s);
    expect(result.absoluteOrder).toBe(4686);
    expect(result.absoluteOrderString).toBe("Ik");
  });

  test("Test from absoluteOrder", () => {
    let result = BopomofoSyllable.FromAbsoluteOrderString("Ik");
    expect(result.absoluteOrder).toBe(4686);
    let string = result.composedString;
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
    let testCases = [
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
      let syllable = BopomofoSyllable.FromComposedString(bopomofo);
      let result = syllable.HanyuPinyinString(true, false);
      expect(result).toBe(expected);
    });
  });

  test("Test HanyuPinyinString with includeTone=false", () => {
    let testCases = [
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
      let syllable = BopomofoSyllable.FromComposedString(bopomofo);
      let result = syllable.HanyuPinyinString(false, false);
      expect(result).toBe(expected);
    });
  });

  test("Test HanyuPinyinString with useVForUUmlaut=true", () => {
    let testCases = [
      ["ㄌㄩ", "lv"],
      ["ㄋㄩˊ", "nv2"],
      ["ㄩㄢˇ", "yuan3"],
      ["ㄐㄩㄝˋ", "jue4"],
      ["ㄒㄩ˙", "xu5"],
    ];

    testCases.forEach(([bopomofo, expected]) => {
      let syllable = BopomofoSyllable.FromComposedString(bopomofo);
      let result = syllable.HanyuPinyinString(true, true);
      expect(result).toBe(expected);
    });
  });

  test("Test HanyuPinyinString special cases", () => {
    // Test empty syllable
    let emptySyllable = new BopomofoSyllable();
    expect(emptySyllable.HanyuPinyinString(true, false)).toBe("");

    // Test special combinations
    let testCases = [
      ["ㄧㄥ", "ying"],
      ["ㄨㄥ", "weng"],
      ["ㄧㄡ", "you"],
      ["ㄧㄣ", "yin"],
      ["ㄨㄟ", "wei"],
      ["ㄩㄥ", "yong"],
      ["ㄩㄣ", "yun"],
    ];

    testCases.forEach(([bopomofo, expected]) => {
      let syllable = BopomofoSyllable.FromComposedString(bopomofo);
      let result = syllable.HanyuPinyinString(true, false);
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
      let syllable = BopomofoSyllable.FromComposedString(bopomofo);
      let result = syllable.HanyuPinyinString(true, false);
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
    let syllable = BopomofoSyllable.FromHanyuPinyin("zhuang1");
    
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
    let syllable2 = BopomofoSyllable.FromHanyuPinyin("zhuang2");
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
      let syllable = BopomofoSyllable.FromComposedString(bopomofo);
      let result = syllable.HanyuPinyinString(true, false);
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
    let syllable1 = new BopomofoSyllable(BopomofoSyllable.B);
    let syllable2 = new BopomofoSyllable(BopomofoSyllable.A);
    
    syllable1.addEqual(syllable2);
    
    expect(syllable1.consonantComponent).toBe(BopomofoSyllable.B);
    expect(syllable1.vowelComponent).toBe(BopomofoSyllable.A);
  });
});
