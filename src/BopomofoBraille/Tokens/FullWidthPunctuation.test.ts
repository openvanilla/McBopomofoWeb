import { BrailleType } from "./BrailleType";
import { FullWidthPunctuation } from "./FullWidthPunctuation";

describe("Test Punctuation", () => {
  test("Test fromBpmf with period", () => {
    const p = FullWidthPunctuation.fromBpmf("。");
    expect(p).toBe(FullWidthPunctuation.period);
  });

  test("Test fromBpmf with comma", () => {
    const p = FullWidthPunctuation.fromBpmf("，");
    expect(p).toBe(FullWidthPunctuation.comma);
  });

  test("Test fromBpmf with invalid input", () => {
    const p = FullWidthPunctuation.fromBpmf("@");
    expect(p).toBe(undefined);
  });

  test("Test fromBraille() with valid braille", () => {
    const p = FullWidthPunctuation.fromBraille("⠤");
    expect(p).toBe(FullWidthPunctuation.period);
  });

  test("Test fromBraille() with valid ASCII braille", () => {
    const p = FullWidthPunctuation.fromBraille("-", BrailleType.ASCII);
    expect(p).toBe(FullWidthPunctuation.period);
  });

  test("Test fromBraille() with invalid braille", () => {
    const p = FullWidthPunctuation.fromBraille("invalid");
    expect(p).toBe(undefined);
  });

  test("Test fromBraille() with invalid ASCII braille", () => {
    const p = FullWidthPunctuation.fromBraille("invalid", BrailleType.ASCII);
    expect(p).toBe(undefined);
  });

  test("Test toBpmf()", () => {
    const result = FullWidthPunctuation.toBpmf(FullWidthPunctuation.period);
    expect(result).toBe("。");
  });

  test("Test toBraille()", () => {
    const result = FullWidthPunctuation.toBraille(FullWidthPunctuation.period);
    expect(result).toBe("⠤");
  });

  test("Test toBraille() with ASCII output", () => {
    const result = FullWidthPunctuation.toBraille(
      FullWidthPunctuation.period,
      BrailleType.ASCII
    );
    expect(result).toBe("-");
  });

  test("Test supposedToBeAtStart() with left quotation mark", () => {
    const result = FullWidthPunctuation.supposedToBeAtStart(
      FullWidthPunctuation.singleQuotationMarkLeft
    );
    expect(result).toBe(true);
  });

  test("Test supposedToBeAtStart() with left parenthesis", () => {
    const result = FullWidthPunctuation.supposedToBeAtStart(
      FullWidthPunctuation.parenthesesLeft
    );
    expect(result).toBe(true);
  });

  test("Test supposedToBeAtStart() with non-start punctuation", () => {
    const result = FullWidthPunctuation.supposedToBeAtStart(
      FullWidthPunctuation.period
    );
    expect(result).toBe(false);
  });

  test("Test allPunctuation array", () => {
    expect(FullWidthPunctuation.allPunctuation.length).toBeGreaterThan(0);
    expect(FullWidthPunctuation.allPunctuation).toContain(
      FullWidthPunctuation.period
    );
  });

  test("Test allBraille array", () => {
    expect(FullWidthPunctuation.allBraille.length).toBe(2);
    expect(FullWidthPunctuation.allBraille[BrailleType.UNICODE]).toContain(
      "⠤"
    );
    expect(FullWidthPunctuation.allBraille[BrailleType.ASCII]).toContain("-");
  });

  test("Test referenceMark", () => {
    const p = FullWidthPunctuation.referenceMark;
    expect(p).toBe(FullWidthPunctuation.referenceMark);
  });

  test("Test toBraille() with referenceMark", () => {
    const result = FullWidthPunctuation.toBraille(
      FullWidthPunctuation.referenceMark
    );
    expect(result).toBe("⠈⠼");
  });

  test("Test toBraille() with referenceMark ASCII output", () => {
    const result = FullWidthPunctuation.toBraille(
      FullWidthPunctuation.referenceMark,
      BrailleType.ASCII
    );
    expect(result).toBe("`#");
  });

  test("Test ASCII punctuation mappings", () => {
    expect(
      FullWidthPunctuation.toBraille(
        FullWidthPunctuation.parenthesesLeft,
        BrailleType.ASCII
      )
    ).toBe("{");
    expect(
      FullWidthPunctuation.toBraille(
        FullWidthPunctuation.doubleQuotationMarkRight,
        BrailleType.ASCII
      )
    ).toBe("00");
    expect(
      FullWidthPunctuation.fromBraille("{", BrailleType.ASCII)
    ).toBe(FullWidthPunctuation.parenthesesLeft);
    expect(
      FullWidthPunctuation.fromBraille("00", BrailleType.ASCII)
    ).toBe(FullWidthPunctuation.doubleQuotationMarkRight);
  });
});
