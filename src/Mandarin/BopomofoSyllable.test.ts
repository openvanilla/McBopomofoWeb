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
});
