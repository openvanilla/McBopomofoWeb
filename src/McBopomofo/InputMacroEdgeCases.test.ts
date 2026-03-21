/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

// This mock must come before any import of inputMacroController to cover the
// `year < 4` branch in getYearBase (InputMacro.ts line 463).

function createMockDateResult(yearValue: number) {
  return {
    year: () => yearValue,
    locale: jest.fn().mockReturnValue({ format: jest.fn().mockReturnValue("mock") }),
    format: jest.fn().mockReturnValue("mock"),
    subtract: jest.fn().mockReturnValue(createMockDateLeaf(yearValue)),
    add: jest.fn().mockReturnValue(createMockDateLeaf(yearValue + 1)),
  };
}

function createMockDateLeaf(yearValue: number) {
  return {
    year: () => yearValue,
    locale: jest.fn().mockReturnValue({ format: jest.fn().mockReturnValue("mock") }),
    format: jest.fn().mockReturnValue("mock"),
    subtract: jest.fn().mockReturnValue({
      year: () => yearValue,
      locale: jest.fn().mockReturnValue({ format: jest.fn().mockReturnValue("mock") }),
      format: jest.fn().mockReturnValue("mock"),
    }),
  };
}

jest.mock("./InputMacroDate", () => {
  const mockDayjs: jest.Mock & { extend?: jest.Mock } = jest.fn(() =>
    createMockDateResult(1)
  );
  mockDayjs.extend = jest.fn();
  return mockDayjs;
});

import { inputMacroController } from "./InputMacro";

describe("InputMacro edge cases (year < 4)", () => {
  test("ganzhi macro works for year 1 (covers year < 4 branch)", () => {
    const result = inputMacroController.handle("MACRO@THIS_YEAR_GANZHI");
    expect(result).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年$/);
  });

  test("Chinese zodiac macro works for year 1 (covers year < 4 branch)", () => {
    const result = inputMacroController.handle("MACRO@THIS_YEAR_CHINESE_ZODIAC");
    expect(result).toMatch(/^[木火土金水][鼠牛虎兔龍蛇馬羊猴雞狗豬]年$/);
  });
});
