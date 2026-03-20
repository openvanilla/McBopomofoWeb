import { RomanNumbers, RomanNumbersError, RomanNumbersStyle } from "./index";
import {
  RomanNumbers as DirectRomanNumbers,
  RomanNumbersError as DirectRomanNumbersError,
  RomanNumbersStyle as DirectRomanNumbersStyle,
} from "./RomanNumbers";

describe("RomanNumbers index exports", () => {
  test("re-exports RomanNumbers", () => {
    expect(RomanNumbers).toBe(DirectRomanNumbers);
  });

  test("re-exports RomanNumbersError", () => {
    expect(RomanNumbersError).toBe(DirectRomanNumbersError);
  });

  test("re-exports RomanNumbersStyle", () => {
    expect(RomanNumbersStyle).toBe(DirectRomanNumbersStyle);
  });
});
