import { Case, ChineseNumbers } from "./ChineseNumbers";
import { TrimZerosAtStart } from "./StringUtils";

describe("Test Chinese Numbers", () => {
  test("TrimZerosAtStart 1", () => {
    let output = TrimZerosAtStart("0001");
    expect(output).toBe("1");
  });

  test("TrimZerosAtStart 2", () => {
    let output = TrimZerosAtStart("0002");
    expect(output).toBe("2");
  });

  test("TrimZerosAtStart 3", () => {
    let output = TrimZerosAtStart("0012");
    expect(output).toBe("12");
  });

  test("Test Chinese Numbers 1", () => {
    let output = ChineseNumbers.generate("1", "", Case.lowercase);
    expect(output).toBe("一");
  });

  test("Test Chinese Numbers 2", () => {
    let output = ChineseNumbers.generate("12", "", Case.lowercase);
    expect(output).toBe("一十二");
  });

  test("Test Chinese Numbers 3", () => {
    let output = ChineseNumbers.generate("1234", "", Case.lowercase);
    expect(output).toBe("一千二百三十四");
  });

  test("Test Chinese Numbers 4", () => {
    let output = ChineseNumbers.generate("1234", "", Case.uppercase);
    expect(output).toBe("壹仟貳佰參拾肆");
  });

  test("Test Chinese Numbers 5", () => {
    let output = ChineseNumbers.generate("1234", "11", Case.uppercase);
    expect(output).toBe("壹仟貳佰參拾肆點壹壹");
  });
});

describe("Additional Chinese Numbers Tests", () => {
  test("Empty integer part", () => {
    let output = ChineseNumbers.generate("", "", Case.lowercase);
    expect(output).toBe("〇");
  });

  test("Zero integer part", () => {
    let output = ChineseNumbers.generate("0", "", Case.lowercase);
    expect(output).toBe("〇");
  });

  test("Zero with decimal", () => {
    let output = ChineseNumbers.generate("0", "5", Case.lowercase);
    expect(output).toBe("〇點五");
  });

  test("Number with zeros in middle - 1001", () => {
    let output = ChineseNumbers.generate("1001", "", Case.lowercase);
    expect(output).toBe("一千〇一");
  });

  test("Number with zeros in middle - 1010", () => {
    let output = ChineseNumbers.generate("1010", "", Case.lowercase);
    expect(output).toBe("一千〇一十");
  });

  test("Number with zeros - 10001", () => {
    let output = ChineseNumbers.generate("10001", "", Case.lowercase);
    expect(output).toBe("一萬〇一");
  });

  test("Large number with 萬", () => {
    let output = ChineseNumbers.generate("12345", "", Case.lowercase);
    expect(output).toBe("一萬二千三百四十五");
  });

  test("Large number with 億", () => {
    let output = ChineseNumbers.generate("123456789", "", Case.lowercase);
    expect(output).toBe("一億二千三百四十五萬六千七百八十九");
  });

  test("Number ending in zero", () => {
    let output = ChineseNumbers.generate("1230", "", Case.lowercase);
    expect(output).toBe("一千二百三十");
  });

  test("Only tens", () => {
    let output = ChineseNumbers.generate("20", "", Case.lowercase);
    expect(output).toBe("二十");
  });

  test("Only hundreds", () => {
    let output = ChineseNumbers.generate("300", "", Case.lowercase);
    expect(output).toBe("三百");
  });

  test("Decimal with multiple digits", () => {
    let output = ChineseNumbers.generate("123", "456", Case.lowercase);
    expect(output).toBe("一百二十三點四五六");
  });

  test("Decimal with zeros", () => {
    let output = ChineseNumbers.generate("123", "405", Case.lowercase);
    expect(output).toBe("一百二十三點四〇五");
  });

  test("Large number uppercase", () => {
    let output = ChineseNumbers.generate("12345", "", Case.uppercase);
    expect(output).toBe("壹萬貳仟參佰肆拾伍");
  });

  test("Number with zeros uppercase", () => {
    let output = ChineseNumbers.generate("1001", "", Case.uppercase);
    expect(output).toBe("壹仟零壹");
  });

  test("Very large number with 兆", () => {
    let output = ChineseNumbers.generate("1234567890123", "", Case.lowercase);
    expect(output).toBe("一兆二千三百四十五億六千七百八十九萬〇一百二十三");
  });

  test("Number with all zeros in middle section", () => {
    let output = ChineseNumbers.generate("10000001", "", Case.lowercase);
    expect(output).toBe("一千萬〇一");
  });

  test("Single digit numbers 0-9 lowercase", () => {
    expect(ChineseNumbers.generate("0", "", Case.lowercase)).toBe("〇");
    expect(ChineseNumbers.generate("1", "", Case.lowercase)).toBe("一");
    expect(ChineseNumbers.generate("2", "", Case.lowercase)).toBe("二");
    expect(ChineseNumbers.generate("9", "", Case.lowercase)).toBe("九");
  });

  test("Single digit numbers 0-9 uppercase", () => {
    expect(ChineseNumbers.generate("0", "", Case.uppercase)).toBe("零");
    expect(ChineseNumbers.generate("1", "", Case.uppercase)).toBe("壹");
    expect(ChineseNumbers.generate("5", "", Case.uppercase)).toBe("伍");
    expect(ChineseNumbers.generate("9", "", Case.uppercase)).toBe("玖");
  });

  test("Numbers 10-19", () => {
    expect(ChineseNumbers.generate("10", "", Case.lowercase)).toBe("一十");
    expect(ChineseNumbers.generate("11", "", Case.lowercase)).toBe("一十一");
    expect(ChineseNumbers.generate("19", "", Case.lowercase)).toBe("一十九");
  });

  test("Round numbers", () => {
    expect(ChineseNumbers.generate("100", "", Case.lowercase)).toBe("一百");
    expect(ChineseNumbers.generate("1000", "", Case.lowercase)).toBe("一千");
    expect(ChineseNumbers.generate("10000", "", Case.lowercase)).toBe("一萬");
  });

  test("Complex decimal patterns", () => {
    let output = ChineseNumbers.generate("0", "123", Case.lowercase);
    expect(output).toBe("〇點一二三");
  });

  test("Leading zeros in integer part", () => {
    let output = ChineseNumbers.generate("0001", "", Case.lowercase);
    expect(output).toBe("一");
  });

  test("Number with multiple zero sections", () => {
    let output = ChineseNumbers.generate("100020003", "", Case.lowercase);
    expect(output).toBe("一億〇二萬〇三");
  });
});
