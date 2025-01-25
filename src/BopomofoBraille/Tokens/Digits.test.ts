import { Digit } from "./Digits";

describe("Test Digits", () => {
  test("Test fromDigits()", () => {
    let result = Digit.fromDigit("1");
    expect(result).toBe(Digit.one);
  });
  test("Test fromDigits()", () => {
    let result = Digit.fromDigit("a");
    expect(result).toBe(undefined);
  });

  test("Test fromBraille()", () => {
    let result = Digit.fromBraille("⠂");
    expect(result).toBe(Digit.one);
  });

  test("Test fromBraille()", () => {
    let result = Digit.fromBraille("a");
    expect(result).toBe(undefined);
  });

  test("Tets toDigit()", () => {
    let result = Digit.toDigit(Digit.one);
    expect(result).toBe(Digit.one);
  });
});
