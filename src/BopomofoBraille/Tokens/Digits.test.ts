import { BrailleType } from "./BrailleType";
import { Digit, DigitRelated } from "./Digits";

describe("Test Digits", () => {
  test("Test fromDigits()", () => {
    const result = Digit.fromDigit("1");
    expect(result).toBe(Digit.one);
  });
  test("Test fromDigits()", () => {
    const result = Digit.fromDigit("a");
    expect(result).toBe(undefined);
  });

  test("Test fromBraille()", () => {
    const result = Digit.fromBraille("⠂");
    expect(result).toBe(Digit.one);
  });

  test("Test fromBraille() with ASCII digit", () => {
    const result = Digit.fromBraille("1", BrailleType.ASCII);
    expect(result).toBe(Digit.one);
  });

  test("Test fromBraille()", () => {
    const result = Digit.fromBraille("a");
    expect(result).toBe(undefined);
  });

  test("Test fromBraille() with invalid ASCII digit", () => {
    const result = Digit.fromBraille("a", BrailleType.ASCII);
    expect(result).toBe(undefined);
  });

  test("Tets toDigit()", () => {
    const result = Digit.toDigit(Digit.one);
    expect(result).toBe(Digit.one);
  });

  test("Test toBraille()", () => {
    const result = Digit.toBraille(Digit.one);
    expect(result).toBe("⠂");
  });

  test("Test toBraille() with ASCII output", () => {
    const result = Digit.toBraille(Digit.one, BrailleType.ASCII);
    expect(result).toBe("1");
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
    const result = DigitRelated.fromPunctuation(".");
    expect(result).toBe(DigitRelated.point);
  });

  test("Test fromPunctuation() with invalid input", () => {
    const result = DigitRelated.fromPunctuation("@");
    expect(result).toBe(undefined);
  });

  test("Test fromBraille() with valid braille", () => {
    const result = DigitRelated.fromBraille("⠨");
    expect(result).toBe(DigitRelated.point);
  });

  test("Test fromBraille() with valid ASCII braille", () => {
    const result = DigitRelated.fromBraille(".", BrailleType.ASCII);
    expect(result).toBe(DigitRelated.point);
  });

  test("Test fromBraille() with invalid braille", () => {
    const result = DigitRelated.fromBraille("invalid");
    expect(result).toBe(undefined);
  });

  test("Test fromBraille() with invalid ASCII braille", () => {
    const result = DigitRelated.fromBraille("invalid", BrailleType.ASCII);
    expect(result).toBe(undefined);
  });

  test("Test toPunctuation()", () => {
    const result = DigitRelated.toPunctuation(DigitRelated.point);
    expect(result).toBe(".");
  });

  test("Test toBraille() for point", () => {
    const result = DigitRelated.toBraille(DigitRelated.point);
    expect(result).toBe("⠨");
  });

  test("Test toBraille() for point with ASCII output", () => {
    const result = DigitRelated.toBraille(
      DigitRelated.point,
      BrailleType.ASCII
    );
    expect(result).toBe(".");
  });

  test("Test toBraille() for percent", () => {
    const result = DigitRelated.toBraille(DigitRelated.percent);
    expect(result).toBe("⠈⠴");
  });

  test("Test toBraille() for percent with ASCII output", () => {
    const result = DigitRelated.toBraille(
      DigitRelated.percent,
      BrailleType.ASCII
    );
    expect(result).toBe("`%");
  });

  test("Test toBraille() for celsius", () => {
    const result = DigitRelated.toBraille(DigitRelated.celsius);
    expect(result).toBe("⠘⠨⠡ ⠰⠠⠉");
  });

  test("Test toBraille() for celsius with ASCII output", () => {
    const result = DigitRelated.toBraille(
      DigitRelated.celsius,
      BrailleType.ASCII
    );
    expect(result).toBe("~.* ;,c");
  });

  test("Test allDigits array", () => {
    expect(DigitRelated.allDigits.length).toBe(3);
    expect(DigitRelated.allDigits).toContain(DigitRelated.point);
  });

  test("Test allBraille array", () => {
    expect(DigitRelated.allBraille.length).toBe(2);
    expect(DigitRelated.allBraille[BrailleType.UNICODE]).toContain("⠨");
    expect(DigitRelated.allBraille[BrailleType.ASCII]).toContain(".");
  });
});
