import {
  containsLiteralReading,
  literalReadingValue,
  readingForDisplay,
} from "./LiteralReading";

describe("literal readings", () => {
  test("decodes every printable ASCII character including hyphen and space", () => {
    for (let code = 32; code <= 126; code++) {
      expect(literalReadingValue("_literal_" + code)).toBe(
        String.fromCharCode(code)
      );
    }
  });
  test("detects literal nodes anywhere in a phrase reading", () => {
    for (const key of [
      "_literal_50",
      "ㄓㄨㄥ-_literal_50",
      "_literal_50-ㄓㄨㄥ",
      "_literal_bad",
    ]) {
      expect(containsLiteralReading(key)).toBe(true);
    }
    expect(containsLiteralReading("ㄓㄨㄥ-ㄨㄣˊ")).toBe(false);
  });
  test("displays literals without changing normal readings", () => {
    expect(readingForDisplay("ㄓㄨㄥ-_literal_50-_literal_45-_literal_51")).toBe(
      "ㄓㄨㄥ-2---3"
    );
    expect(readingForDisplay("ㄓㄨㄥ-ㄨㄣˊ")).toBe("ㄓㄨㄥ-ㄨㄣˊ");
    expect(readingForDisplay("_literal_bad")).not.toContain("_literal_");
    expect(literalReadingValue("_literal_127")).toBeUndefined();
    expect(literalReadingValue("_literal_50-ㄓㄨㄥ")).toBeUndefined();
  });
});
