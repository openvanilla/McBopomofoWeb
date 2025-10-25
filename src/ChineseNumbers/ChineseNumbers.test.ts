import { Case, ChineseNumbers } from "./ChineseNumbers";
import { TrimZerosAtStart } from "./StringUtils";

describe("TrimZerosAtStart", () => {
  test("removes leading zeros from single-digit input", () => {
    let output = TrimZerosAtStart("0001");
    expect(output).toBe("1");
  });

  test("removes leading zeros while preserving numeric value", () => {
    let output = TrimZerosAtStart("0002");
    expect(output).toBe("2");
  });

  test("removes leading zeros from multi-digit input", () => {
    let output = TrimZerosAtStart("0012");
    expect(output).toBe("12");
  });
});

describe("ChineseNumbers.generate basic formatting", () => {
  test("renders lowercase numerals for 1", () => {
    let output = ChineseNumbers.generate("1", "", Case.lowercase);
    expect(output).toBe("一");
  });

  test("renders lowercase numerals for 12", () => {
    let output = ChineseNumbers.generate("12", "", Case.lowercase);
    expect(output).toBe("一十二");
  });

  test("renders lowercase numerals for 1234", () => {
    let output = ChineseNumbers.generate("1234", "", Case.lowercase);
    expect(output).toBe("一千二百三十四");
  });

  test("renders uppercase numerals for 1234", () => {
    let output = ChineseNumbers.generate("1234", "", Case.uppercase);
    expect(output).toBe("壹仟貳佰參拾肆");
  });

  test("renders uppercase numerals for decimals", () => {
    let output = ChineseNumbers.generate("1234", "11", Case.uppercase);
    expect(output).toBe("壹仟貳佰參拾肆點壹壹");
  });
});

describe("ChineseNumbers.generate edge cases", () => {
  test("returns zero when integer part is empty", () => {
    let output = ChineseNumbers.generate("", "", Case.lowercase);
    expect(output).toBe("〇");
  });

  test("returns zero when integer part is empty and fractional is also empty", () => {
    let output = ChineseNumbers.generate("", "", Case.lowercase);
    expect(output).toBe("〇");
  });

  test("returns zero when integer part is literally zero", () => {
    let output = ChineseNumbers.generate("0", "", Case.lowercase);
    expect(output).toBe("〇");
  });

  test("renders zero integer with decimal digits", () => {
    let output = ChineseNumbers.generate("0", "5", Case.lowercase);
    expect(output).toBe("〇點五");
  });

  test("preserves internal zeros for 1001", () => {
    let output = ChineseNumbers.generate("1001", "", Case.lowercase);
    expect(output).toBe("一千〇一");
  });

  test("preserves internal zeros for 1010", () => {
    let output = ChineseNumbers.generate("1010", "", Case.lowercase);
    expect(output).toBe("一千〇一十");
  });

  test("formats 10001 with ten-thousands placeholder", () => {
    let output = ChineseNumbers.generate("10001", "", Case.lowercase);
    expect(output).toBe("一萬〇一");
  });

  test("renders numbers that include the 萬 unit", () => {
    let output = ChineseNumbers.generate("12345", "", Case.lowercase);
    expect(output).toBe("一萬二千三百四十五");
  });

  test("renders numbers that include the 億 unit", () => {
    let output = ChineseNumbers.generate("123456789", "", Case.lowercase);
    expect(output).toBe("一億二千三百四十五萬六千七百八十九");
  });

  test("avoids trailing 零 for numbers ending in zero", () => {
    let output = ChineseNumbers.generate("1230", "", Case.lowercase);
    expect(output).toBe("一千二百三十");
  });

  test("renders pure tens values", () => {
    let output = ChineseNumbers.generate("20", "", Case.lowercase);
    expect(output).toBe("二十");
  });

  test("renders pure hundreds values", () => {
    let output = ChineseNumbers.generate("300", "", Case.lowercase);
    expect(output).toBe("三百");
  });

  test("renders multi-digit decimal parts", () => {
    let output = ChineseNumbers.generate("123", "456", Case.lowercase);
    expect(output).toBe("一百二十三點四五六");
  });

  test("includes zeros within decimal parts", () => {
    let output = ChineseNumbers.generate("123", "405", Case.lowercase);
    expect(output).toBe("一百二十三點四〇五");
  });

  test("supports uppercase formatting for large values", () => {
    let output = ChineseNumbers.generate("12345", "", Case.uppercase);
    expect(output).toBe("壹萬貳仟參佰肆拾伍");
  });

  test("supports uppercase formatting with internal zeros", () => {
    let output = ChineseNumbers.generate("1001", "", Case.uppercase);
    expect(output).toBe("壹仟零壹");
  });

  test("handles numbers in the 兆 range", () => {
    let output = ChineseNumbers.generate("1234567890123", "", Case.lowercase);
    expect(output).toBe("一兆二千三百四十五億六千七百八十九萬〇一百二十三");
  });

  test("handles multiple internal zero segments", () => {
    let output = ChineseNumbers.generate("10000001", "", Case.lowercase);
    expect(output).toBe("一千萬〇一");
  });

  test("maps single digits to lowercase numerals", () => {
    expect(ChineseNumbers.generate("0", "", Case.lowercase)).toBe("〇");
    expect(ChineseNumbers.generate("1", "", Case.lowercase)).toBe("一");
    expect(ChineseNumbers.generate("2", "", Case.lowercase)).toBe("二");
    expect(ChineseNumbers.generate("9", "", Case.lowercase)).toBe("九");
  });

  test("maps single digits to uppercase numerals", () => {
    expect(ChineseNumbers.generate("0", "", Case.uppercase)).toBe("零");
    expect(ChineseNumbers.generate("1", "", Case.uppercase)).toBe("壹");
    expect(ChineseNumbers.generate("5", "", Case.uppercase)).toBe("伍");
    expect(ChineseNumbers.generate("9", "", Case.uppercase)).toBe("玖");
  });

  test("renders ten-to-nineteen range", () => {
    expect(ChineseNumbers.generate("10", "", Case.lowercase)).toBe("一十");
    expect(ChineseNumbers.generate("11", "", Case.lowercase)).toBe("一十一");
    expect(ChineseNumbers.generate("19", "", Case.lowercase)).toBe("一十九");
  });

  test("renders powers of ten", () => {
    expect(ChineseNumbers.generate("100", "", Case.lowercase)).toBe("一百");
    expect(ChineseNumbers.generate("1000", "", Case.lowercase)).toBe("一千");
    expect(ChineseNumbers.generate("10000", "", Case.lowercase)).toBe("一萬");
  });

  test("renders decimal-only inputs", () => {
    let output = ChineseNumbers.generate("0", "123", Case.lowercase);
    expect(output).toBe("〇點一二三");
  });

  test("ignores leading zeros in integer component", () => {
    let output = ChineseNumbers.generate("0001", "", Case.lowercase);
    expect(output).toBe("一");
  });

  test("formats numbers with repeated zero sections", () => {
    let output = ChineseNumbers.generate("100020003", "", Case.lowercase);
    expect(output).toBe("一億〇二萬〇三");
  });
});
