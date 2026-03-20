import { BrailleType } from "./BrailleType";
import { HalfWidthPunctuation } from "./HalfWidthPunctuation";

describe("Test HalfWidthPunctuation", () => {
  test("Test fromPunctuation() with valid period", () => {
    const result = HalfWidthPunctuation.fromPunctuation(".");
    expect(result).toBe(HalfWidthPunctuation.period);
  });

  test("Test fromPunctuation() with valid comma", () => {
    const result = HalfWidthPunctuation.fromPunctuation(",");
    expect(result).toBe(HalfWidthPunctuation.comma);
  });

  test("Test fromPunctuation() with invalid input", () => {
    const result = HalfWidthPunctuation.fromPunctuation("@");
    expect(result).toBe(undefined);
  });

  test("Test fromBraille() with valid braille for period", () => {
    const result = HalfWidthPunctuation.fromBraille("⠲");
    expect(result).toBe(HalfWidthPunctuation.period);
  });

  test("Test fromBraille() with valid braille for comma", () => {
    const result = HalfWidthPunctuation.fromBraille("⠂");
    expect(result).toBe(HalfWidthPunctuation.comma);
  });

  test("Test fromBraille() with valid ASCII braille", () => {
    const result = HalfWidthPunctuation.fromBraille(".", BrailleType.ASCII);
    expect(result).toBe(HalfWidthPunctuation.period);
  });

  test("Test fromBraille() with invalid braille", () => {
    const result = HalfWidthPunctuation.fromBraille("invalid");
    expect(result).toBe(undefined);
  });

  test("Test fromBraille() with invalid ASCII braille", () => {
    const result = HalfWidthPunctuation.fromBraille(
      "invalid",
      BrailleType.ASCII
    );
    expect(result).toBe(undefined);
  });

  test("Test toBpmf()", () => {
    const result = HalfWidthPunctuation.toBpmf(HalfWidthPunctuation.period);
    expect(result).toBe(".");
  });

  test("Test toBraille() for period", () => {
    const result = HalfWidthPunctuation.toBraille(HalfWidthPunctuation.period);
    expect(result).toBe("⠲");
  });

  test("Test toBraille() for period with ASCII output", () => {
    const result = HalfWidthPunctuation.toBraille(
      HalfWidthPunctuation.period,
      BrailleType.ASCII
    );
    expect(result).toBe(".");
  });

  test("Test toBraille() for comma", () => {
    const result = HalfWidthPunctuation.toBraille(HalfWidthPunctuation.comma);
    expect(result).toBe("⠂");
  });

  test("Test ASCII punctuation mappings", () => {
    expect(
      HalfWidthPunctuation.toBraille(
        HalfWidthPunctuation.dotDotDot,
        BrailleType.ASCII
      )
    ).toBe("...");
    expect(
      HalfWidthPunctuation.toBraille(
        HalfWidthPunctuation.doubleQuotationMarkLeft,
        BrailleType.ASCII
      )
    ).toBe("8");
    expect(
      HalfWidthPunctuation.fromBraille("...", BrailleType.ASCII)
    ).toBe(HalfWidthPunctuation.dotDotDot);
    expect(HalfWidthPunctuation.fromBraille("8", BrailleType.ASCII)).toBe(
      HalfWidthPunctuation.singleQuotationMarkLeft
    );
  });

  test("Test allPunctuation array", () => {
    expect(HalfWidthPunctuation.allPunctuation.length).toBeGreaterThan(0);
    expect(HalfWidthPunctuation.allPunctuation).toContain(
      HalfWidthPunctuation.period
    );
  });

  test("Test allBraille array", () => {
    expect(HalfWidthPunctuation.allBraille.length).toBe(2);
    expect(HalfWidthPunctuation.allBraille[BrailleType.UNICODE]).toContain(
      "⠲"
    );
    expect(HalfWidthPunctuation.allBraille[BrailleType.ASCII]).toContain(".");
  });
});
