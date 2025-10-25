import { FullWidthPunctuation } from "./FullWidthPunctuation";

describe("Test Punctuation", () => {
  test("Test fromBpmf with period", () => {
    let p = FullWidthPunctuation.fromBpmf("。");
    expect(p).toBe(FullWidthPunctuation.period);
  });

  test("Test fromBpmf with comma", () => {
    let p = FullWidthPunctuation.fromBpmf("，");
    expect(p).toBe(FullWidthPunctuation.comma);
  });

  test("Test fromBpmf with invalid input", () => {
    let p = FullWidthPunctuation.fromBpmf("@");
    expect(p).toBe(undefined);
  });

  test("Test fromBraille() with valid braille", () => {
    let p = FullWidthPunctuation.fromBraille("⠤");
    expect(p).toBe(FullWidthPunctuation.period);
  });

  test("Test fromBraille() with invalid braille", () => {
    let p = FullWidthPunctuation.fromBraille("invalid");
    expect(p).toBe(undefined);
  });

  test("Test toBpmf()", () => {
    let result = FullWidthPunctuation.toBpmf(FullWidthPunctuation.period);
    expect(result).toBe("。");
  });

  test("Test toBraille()", () => {
    let result = FullWidthPunctuation.toBraille(FullWidthPunctuation.period);
    expect(result).toBe("⠤");
  });

  test("Test supposedToBeAtStart() with left quotation mark", () => {
    let result = FullWidthPunctuation.supposedToBeAtStart(
      FullWidthPunctuation.singleQuotationMarkLeft
    );
    expect(result).toBe(true);
  });

  test("Test supposedToBeAtStart() with left parenthesis", () => {
    let result = FullWidthPunctuation.supposedToBeAtStart(
      FullWidthPunctuation.parenthesesLeft
    );
    expect(result).toBe(true);
  });

  test("Test supposedToBeAtStart() with non-start punctuation", () => {
    let result = FullWidthPunctuation.supposedToBeAtStart(
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
    expect(FullWidthPunctuation.allBraille.length).toBeGreaterThan(0);
    expect(FullWidthPunctuation.allBraille).toContain("⠤");
  });
});
