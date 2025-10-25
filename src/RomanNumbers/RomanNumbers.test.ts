import {
  RomanNumbers,
  RomanNumbersError,
  RomanNumbersStyle,
} from "./RomanNumbers";

describe("RomanNumbers.convertString", () => {
  test("returns ASCII Roman numerals for standard digits", () => {
    const testCases = [
      ["0", ""],
      ["1", "I"],
      ["3999", "MMMCMXCIX"],
      ["2000", "MM"],
      ["2025", "MMXXV"],
    ];

    for (const [input, expected] of testCases) {
      const output = RomanNumbers.convertString(
        input,
        RomanNumbersStyle.Alphabets
      );
      expect(output).toBe(expected);
    }
  });

  test("returns full-width upper-case Roman numerals", () => {
    const testCases = [
      ["0", ""],
      ["1", "Ⅰ"],
      ["3999", "ⅯⅯⅯⅭⅯⅩⅭⅨ"],
      ["2000", "ⅯⅯ"],
      ["2025", "ⅯⅯⅩⅩⅤ"],
    ];
    for (const [input, expected] of testCases) {
      const output = RomanNumbers.convertString(
        input,
        RomanNumbersStyle.FullWidthUpper
      );
      expect(output).toBe(expected);
    }
  });

  test("returns full-width lower-case Roman numerals", () => {
    const testCases = [
      ["0", ""],
      ["1", "ⅰ"],
      ["3999", "ⅿⅿⅿⅽⅿⅹⅽⅸ"],
      ["2000", "ⅿⅿ"],
      ["2025", "ⅿⅿⅹⅹⅴ"],
    ];
    for (const [input, expected] of testCases) {
      const output = RomanNumbers.convertString(
        input,
        RomanNumbersStyle.FullWidthLower
      );
      expect(output).toBe(expected);
    }
  });
});

describe("RomanNumbers.convert", () => {
  test.each([
    [RomanNumbersStyle.FullWidthUpper, 11, "Ⅺ"],
    [RomanNumbersStyle.FullWidthUpper, 12, "Ⅻ"],
    [RomanNumbersStyle.FullWidthLower, 11, "ⅺ"],
    [RomanNumbersStyle.FullWidthLower, 12, "ⅻ"],
  ])("returns precomposed numerals for %s %s", (style, value, expected) => {
    expect(RomanNumbers.convert(value, style)).toBe(expected);
  });

  test("throws when input is greater than 3999", () => {
    expect(() => RomanNumbers.convert(4000)).toThrow(RomanNumbersError);
  });

  test("throws when input is negative", () => {
    expect(() => RomanNumbers.convert(-1)).toThrow(RomanNumbersError);
  });
});

describe("RomanNumbers.convertString error handling", () => {
  test("throws when the input cannot be parsed", () => {
    expect(() => RomanNumbers.convertString("not-a-number")).toThrow(
      RomanNumbersError
    );
  });
});
