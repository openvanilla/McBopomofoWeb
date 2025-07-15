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

describe("Additional BopomofoSyllable Tests", () => {
  // Test all vowels without consonants
  test("should convert vowel-only syllables", () => {
    expect(BopomofoSyllable.fromBpmf("ㄚ").braille).toBe("⠜⠄");
    expect(BopomofoSyllable.fromBpmf("ㄛ").braille).toBe("⠣⠄");
    expect(BopomofoSyllable.fromBpmf("ㄜ").braille).toBe("⠮⠄");
    expect(BopomofoSyllable.fromBpmf("ㄝ").braille).toBe("⠢⠄");
    expect(BopomofoSyllable.fromBpmf("ㄞ").braille).toBe("⠺⠄");
    expect(BopomofoSyllable.fromBpmf("ㄟ").braille).toBe("⠴⠄");
    expect(BopomofoSyllable.fromBpmf("ㄠ").braille).toBe("⠩⠄");
    expect(BopomofoSyllable.fromBpmf("ㄡ").braille).toBe("⠷⠄");
    expect(BopomofoSyllable.fromBpmf("ㄢ").braille).toBe("⠧⠄");
    expect(BopomofoSyllable.fromBpmf("ㄣ").braille).toBe("⠥⠄");
    expect(BopomofoSyllable.fromBpmf("ㄤ").braille).toBe("⠭⠄");
    expect(BopomofoSyllable.fromBpmf("ㄥ").braille).toBe("⠵⠄");
    expect(BopomofoSyllable.fromBpmf("ㄦ").braille).toBe("⠱⠄");
  });

  // Test middle vowels alone
  test("should convert middle vowel-only syllables", () => {
    expect(BopomofoSyllable.fromBpmf("ㄧ").braille).toBe("⠡⠄");
    expect(BopomofoSyllable.fromBpmf("ㄨ").braille).toBe("⠌⠄");
    expect(BopomofoSyllable.fromBpmf("ㄩ").braille).toBe("⠳⠄");
  });

  // Test all tone variations
  test("should convert all tones correctly", () => {
    expect(BopomofoSyllable.fromBpmf("ㄇㄚ").braille).toBe("⠍⠜⠄"); // tone1
    expect(BopomofoSyllable.fromBpmf("ㄇㄚˊ").braille).toBe("⠍⠜⠂"); // tone2
    expect(BopomofoSyllable.fromBpmf("ㄇㄚˇ").braille).toBe("⠍⠜⠈"); // tone3
    expect(BopomofoSyllable.fromBpmf("ㄇㄚˋ").braille).toBe("⠍⠜⠐"); // tone4
    expect(BopomofoSyllable.fromBpmf("ㄇㄚ˙").braille).toBe("⠍⠜⠁"); // tone5
  });

  // Test ㄧ combinations
  test("should convert ㄧ combinations correctly", () => {
    expect(BopomofoSyllable.fromBpmf("ㄧㄚ").braille).toBe("⠾⠄");
    expect(BopomofoSyllable.fromBpmf("ㄧㄛ").braille).toBe("⠴⠄");
    expect(BopomofoSyllable.fromBpmf("ㄧㄝ").braille).toBe("⠬⠄");
    expect(BopomofoSyllable.fromBpmf("ㄧㄞ").braille).toBe("⠢⠄");
    expect(BopomofoSyllable.fromBpmf("ㄧㄠ").braille).toBe("⠪⠄");
    expect(BopomofoSyllable.fromBpmf("ㄧㄡ").braille).toBe("⠎⠄");
    expect(BopomofoSyllable.fromBpmf("ㄧㄢ").braille).toBe("⠞⠄");
    expect(BopomofoSyllable.fromBpmf("ㄧㄣ").braille).toBe("⠹⠄");
    expect(BopomofoSyllable.fromBpmf("ㄧㄤ").braille).toBe("⠨⠄");
    expect(BopomofoSyllable.fromBpmf("ㄧㄥ").braille).toBe("⠽⠄");
  });

  // Test ㄨ combinations
  test("should convert ㄨ combinations correctly", () => {
    expect(BopomofoSyllable.fromBpmf("ㄨㄚ").braille).toBe("⠔⠄");
    expect(BopomofoSyllable.fromBpmf("ㄨㄛ").braille).toBe("⠒⠄");
    expect(BopomofoSyllable.fromBpmf("ㄨㄞ").braille).toBe("⠶⠄");
    expect(BopomofoSyllable.fromBpmf("ㄨㄟ").braille).toBe("⠫⠄");
    expect(BopomofoSyllable.fromBpmf("ㄨㄢ").braille).toBe("⠻⠄");
    expect(BopomofoSyllable.fromBpmf("ㄨㄣ").braille).toBe("⠿⠄");
    expect(BopomofoSyllable.fromBpmf("ㄨㄤ").braille).toBe("⠸⠄");
    expect(BopomofoSyllable.fromBpmf("ㄨㄥ").braille).toBe("⠯⠄");
  });

  // Test ㄩ combinations
  test("should convert ㄩ combinations correctly", () => {
    expect(BopomofoSyllable.fromBpmf("ㄩㄝ").braille).toBe("⠦⠄");
    expect(BopomofoSyllable.fromBpmf("ㄩㄢ").braille).toBe("⠘⠄");
    expect(BopomofoSyllable.fromBpmf("ㄩㄣ").braille).toBe("⠲⠄");
    expect(BopomofoSyllable.fromBpmf("ㄩㄥ").braille).toBe("⠖⠄");
  });

  // Test consonant + vowel combinations
  test("should convert consonant + vowel combinations", () => {
    expect(BopomofoSyllable.fromBpmf("ㄅㄚ").braille).toBe("⠕⠜⠄");
    expect(BopomofoSyllable.fromBpmf("ㄆㄛ").braille).toBe("⠏⠣⠄");
    expect(BopomofoSyllable.fromBpmf("ㄇㄜ").braille).toBe("⠍⠮⠄");
    expect(BopomofoSyllable.fromBpmf("ㄈㄞ").braille).toBe("⠟⠺⠄");
  });

  // Test consonant + middle vowel + vowel combinations
  test("should convert consonant + middle vowel + vowel combinations", () => {
    expect(BopomofoSyllable.fromBpmf("ㄅㄧㄚ").braille).toBe("⠕⠾⠄");
    expect(BopomofoSyllable.fromBpmf("ㄆㄨㄚ").braille).toBe("⠏⠔⠄");
    expect(BopomofoSyllable.fromBpmf("ㄇㄩㄝ").braille).toBe("⠍⠦⠄");
    expect(BopomofoSyllable.fromBpmf("ㄈㄧㄠ").braille).toBe("⠟⠪⠄");
  });

  // Test ambiguous consonants (ㄍ/ㄐ, ㄑ/ㄘ, ㄒ/ㄙ)
  test("should distinguish ambiguous consonants in Braille", () => {
    // ㄍ vs ㄐ
    expect(BopomofoSyllable.fromBpmf("ㄍㄚ").braille).toBe("⠅⠜⠄");
    expect(BopomofoSyllable.fromBpmf("ㄐㄧㄚ").braille).toBe("⠅⠾⠄");

    // ㄑ vs ㄘ
    expect(BopomofoSyllable.fromBpmf("ㄘㄚ").braille).toBe("⠚⠜⠄");
    expect(BopomofoSyllable.fromBpmf("ㄑㄧㄚ").braille).toBe("⠚⠾⠄");

    // ㄒ vs ㄙ
    expect(BopomofoSyllable.fromBpmf("ㄙㄚ").braille).toBe("⠑⠜⠄");
    expect(BopomofoSyllable.fromBpmf("ㄒㄧㄚ").braille).toBe("⠑⠾⠄");
  });

  // Test reverse conversion from Braille
  test("should convert from Braille to Bopomofo correctly", () => {
    expect(BopomofoSyllable.fromBraille("⠕⠜⠄").bpmf).toBe("ㄅㄚ");
    expect(BopomofoSyllable.fromBraille("⠏⠣⠂").bpmf).toBe("ㄆㄛˊ");
    expect(BopomofoSyllable.fromBraille("⠍⠮⠈").bpmf).toBe("ㄇㄜˇ");
    expect(BopomofoSyllable.fromBraille("⠟⠺⠐").bpmf).toBe("ㄈㄞˋ");
    expect(BopomofoSyllable.fromBraille("⠙⠩⠁").bpmf).toBe("ㄉㄠ˙");
  });

  // Test error cases with proper error messages
  test("should throw errors for invalid combinations", () => {
    expect(() => {
      BopomofoSyllable.fromBpmf("ㄅㄅ");
    }).toThrow();

    expect(() => {
      BopomofoSyllable.fromBpmf("ㄧㄧ");
    }).toThrow();

    expect(() => {
      BopomofoSyllable.fromBpmf("ㄚㄚ");
    }).toThrow();

    expect(() => {
      BopomofoSyllable.fromBpmf("ㄚˊˇ");
    }).toThrow();

    expect(() => {
      BopomofoSyllable.fromBpmf("ㄧㄇ");
    }).toThrow();

    expect(() => {
      BopomofoSyllable.fromBpmf("ㄚㄧ");
    }).toThrow();
  });

  // Test Braille error cases
  test("should throw errors for invalid Braille", () => {
    expect(() => {
      BopomofoSyllable.fromBraille("⠄");
    }).toThrow();

    expect(() => {
      BopomofoSyllable.fromBraille("⠕⠜");
    }).toThrow();

    expect(() => {
      BopomofoSyllable.fromBraille("⠄⠄⠄");
    }).toThrow();
  });

  // Test whitespace handling
  test("should handle whitespace in input", () => {
    expect(BopomofoSyllable.fromBpmf(" ㄅㄚ ").braille).toBe("⠕⠜⠄");
    expect(BopomofoSyllable.fromBraille(" ⠕⠜⠄ ").bpmf).toBe("ㄅㄚ");
  });
});
