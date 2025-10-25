import { Digit, DigitRelated } from "./Digits";

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

  test("Test toBraille()", () => {
    let result = Digit.toBraille(Digit.one);
    expect(result).toBe("⠂");
  });

  test("Test allDigits array", () => {
    expect(Digit.allDigits.length).toBe(10);
    expect(Digit.allDigits).toContain(Digit.zero);
    expect(Digit.allDigits).toContain(Digit.nine);
  });

  test("Test allBraille array", () => {
    expect(Digit.allBraille.length).toBe(10);
    expect(Digit.allBraille).toContain("⠴");
    expect(Digit.allBraille).toContain("⠔");
  });
});

describe("Test DigitRelated", () => {
  test("Test fromPunctuation() with valid punctuation", () => {
    let result = DigitRelated.fromPunctuation(".");
    expect(result).toBe(DigitRelated.point);
  });

  test("Test fromPunctuation() with invalid input", () => {
    let result = DigitRelated.fromPunctuation("@");
    expect(result).toBe(undefined);
  });

  test("Test fromBraille() with valid braille", () => {
    let result = DigitRelated.fromBraille("⠨");
    expect(result).toBe(DigitRelated.point);
  });

  test("Test fromBraille() with invalid braille", () => {
    let result = DigitRelated.fromBraille("invalid");
    expect(result).toBe(undefined);
  });

  test("Test toPunctuation()", () => {
    let result = DigitRelated.toPunctuation(DigitRelated.point);
    expect(result).toBe(".");
  });

  test("Test toBraille() for point", () => {
    let result = DigitRelated.toBraille(DigitRelated.point);
    expect(result).toBe("⠨");
  });

  test("Test toBraille() for percent", () => {
    let result = DigitRelated.toBraille(DigitRelated.percent);
    expect(result).toBe("⠈⠴");
  });

  test("Test toBraille() for celsius", () => {
    let result = DigitRelated.toBraille(DigitRelated.celsius);
    expect(result).toBe("⠘⠨⠡ ⠰⠠⠉");
  });

  test("Test allDigits array", () => {
    expect(DigitRelated.allDigits.length).toBe(3);
    expect(DigitRelated.allDigits).toContain(DigitRelated.point);
  });

  test("Test allBraille array", () => {
    expect(DigitRelated.allBraille.length).toBe(3);
    expect(DigitRelated.allBraille).toContain("⠨");
  });
});
