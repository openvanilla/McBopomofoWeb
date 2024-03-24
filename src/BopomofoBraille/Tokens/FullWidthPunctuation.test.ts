import { FullWidthPunctuation } from "./FullWidthPunctuation";

describe("Test Punctuation", () => {
  test("Test Punctuation 1", () => {
    let p = FullWidthPunctuation.fromBpmf("。");
    expect(p).toBe(FullWidthPunctuation.period);
  });

  test("Test Punctuation 2", () => {
    let p = FullWidthPunctuation.fromBpmf("，");
    expect(p).toBe(FullWidthPunctuation.comma);
  });
});
