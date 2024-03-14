/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BopomofoSyllable } from "./index";

describe("Test Pinyin", () => {
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
