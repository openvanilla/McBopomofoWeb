import { Punctuation } from "./Punctuation";

describe("Test Punctuation", () => {
  test("Test Punctuation 1", () => {
    let p = Punctuation.fromBpmf("。");
    expect(p).toBe(Punctuation.period);
  });

  test("Test Punctuation 2", () => {
    let p = Punctuation.fromBpmf("，");
    expect(p).toBe(Punctuation.comma);
  });
});
