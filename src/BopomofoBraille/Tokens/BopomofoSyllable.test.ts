import { BopomofoSyllable } from "./BopomofoSyllable";

describe("Test BopomofoSyllable", () => {
  test("should convert single consonant ㄘ to ⠚⠱⠄", () => {
    let result = BopomofoSyllable.fromBpmf("ㄘ");
    expect(result.braille).toBe("⠚⠱⠄");
  });

  test("should convert single consonant ㄙ to ⠑⠱⠄", () => {
    let result = BopomofoSyllable.fromBpmf("ㄙ");
    expect(result.braille).toBe("⠑⠱⠄");
  });

  test("should convert ⠁⠱⠄ to ㄓ", () => {
    let result = BopomofoSyllable.fromBraille("⠁⠱⠄");
    expect(result.bpmf).toBe("ㄓ");
  });

  test("should convert ⠃⠱⠄ to ㄔ", () => {
    let result = BopomofoSyllable.fromBraille("⠃⠱⠄");
    expect(result.bpmf).toBe("ㄔ");
  });

  test("should convert ⠊⠱⠄ to ㄕ", () => {
    let result = BopomofoSyllable.fromBraille("⠊⠱⠄");
    expect(result.bpmf).toBe("ㄕ");
  });

  test("should throw error for invalid consonant sequence", () => {
    expect(() => {
      BopomofoSyllable.fromBpmf("ㄅㄆ");
    }).toThrow("Invalid Bopomofo: multiple consonants");
  });

  test("should throw error for consonant after vowel", () => {
    expect(() => {
      BopomofoSyllable.fromBpmf("ㄧㄅ");
    }).toThrow("Invalid Bopomofo: consonant after vowel");
  });

  test("should convert ㄉㄠˋ to ⠙⠩⠐", () => {
    let result = BopomofoSyllable.fromBpmf("ㄉㄠˋ");
    expect(result.braille).toBe("⠙⠩⠐");
  });

  test("should convert ⠙⠩⠐ to ㄉㄠˋ", () => {
    let result = BopomofoSyllable.fromBraille("⠙⠩⠐");
    expect(result.bpmf).toBe("ㄉㄠˋ");
  });

  test("should convert ㄓㄨㄥ to ⠁⠯⠄", () => {
    let result = BopomofoSyllable.fromBpmf("ㄓㄨㄥ");
    expect(result.braille).toBe("⠁⠯⠄");
  });

  test("should convert ⠁⠯⠄ to ㄓㄨㄥ", () => {
    let result = BopomofoSyllable.fromBraille("⠁⠯⠄");
    expect(result.bpmf).toBe("ㄓㄨㄥ");
  });

  test("should convert ㄒㄧㄢˊ to ⠑⠞⠂", () => {
    let result = BopomofoSyllable.fromBpmf("ㄒㄧㄢˊ");
    expect(result.braille).toBe("⠑⠞⠂");
  });

  test("should convert ⠑⠞⠂ to ㄒㄧㄢˊ", () => {
    let result = BopomofoSyllable.fromBraille("⠑⠞⠂");
    expect(result.bpmf).toBe("ㄒㄧㄢˊ");
  });

  test("should throw error for invalid Bopomofo", () => {
    expect(() => {
      BopomofoSyllable.fromBpmf("");
    }).toThrow("Invalid Bopomofo length");

    expect(() => {
      BopomofoSyllable.fromBpmf("invalid");
    }).toThrow("Invalid Bopomofo: invalid character");
  });

  test("should throw error for invalid Braille", () => {
    expect(() => {
      BopomofoSyllable.fromBraille("");
    }).toThrow("Invalid Braille length");

    expect(() => {
      BopomofoSyllable.fromBraille("invalid");
    }).toThrow("Invalid character in Braille");
  });

  test("should convert ㄋㄧˇ to ⠝⠡⠈", () => {
    let result = BopomofoSyllable.fromBpmf("ㄋㄧˇ");
    expect(result.braille).toBe("⠝⠡⠈");
  });

  test("should convert ⠝⠡⠈ to ㄋㄧˇ", () => {
    let result = BopomofoSyllable.fromBraille("⠝⠡⠈");
    expect(result.bpmf).toBe("ㄋㄧˇ");
  });

  test("should convert ㄨㄢ to ⠻⠄", () => {
    let result = BopomofoSyllable.fromBpmf("ㄨㄢ");
    expect(result.braille).toBe("⠻⠄");
  });

  test("should convert ㄧㄤ to ⠨⠄", () => {
    let result = BopomofoSyllable.fromBpmf("ㄧㄤ");
    expect(result.braille).toBe("⠨⠄");
  });

  test("should convert ⠨⠄ to ㄧㄤ", () => {
    let result = BopomofoSyllable.fromBraille("⠨⠄");
    expect(result.bpmf).toBe("ㄧㄤ");
  });

  test("should convert ㄏㄢˇ to ⠗⠧⠈", () => {
    let result = BopomofoSyllable.fromBpmf("ㄏㄢˇ");
    expect(result.braille).toBe("⠗⠧⠈");
  });
});
