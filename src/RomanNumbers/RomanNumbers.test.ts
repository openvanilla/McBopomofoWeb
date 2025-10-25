import { RomanNumbers, RomanNumbersStyle } from "./RomanNumbers";

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
      console.log("output" + output);
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
