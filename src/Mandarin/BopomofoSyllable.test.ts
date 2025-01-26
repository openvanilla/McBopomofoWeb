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
      ["xiong1", "ㄒㄩㄥ"],
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
});
