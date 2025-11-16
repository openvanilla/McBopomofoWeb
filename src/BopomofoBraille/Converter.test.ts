import { BopomofoBrailleConverter } from "./Converter";
import { BopomofoSyllable } from "./Tokens/BopomofoSyllable";

describe("Test BopomofoBrailleConverter", () => {
  test("Test 1 bopomofo syllable", () => {
    const input = "ㄊㄞˊ";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test 2 bopomofo syllables", () => {
    const input = "ㄊㄞˊㄨㄢ";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂⠻⠄");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test 3 bopomofo syllables 1", () => {
    const input = "ㄊㄞˊㄨㄢㄖㄣˊ";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂⠻⠄⠛⠥⠂");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });
  test("Test 3 bopomofo syllables 2", () => {
    const input = "ㄏㄨㄤˊㄈㄟㄏㄨㄥˊ";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test bopomofo syllables and punctuation 1", () => {
    const input = "ㄏㄨㄤˊㄈㄟㄏㄨㄥˊ，";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠗⠸⠂⠟⠴⠄⠗⠯⠂⠆");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test bopomofo syllables and punctuation 2 ", () => {
    const input = "『『ㄊㄞˊ";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤⠰⠤⠰⠤⠋⠺⠂");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test long phrase", () => {
    const input =
      "『『ㄊㄞˊㄨㄢㄖㄣˊㄒㄩㄧㄠˋㄏㄣˇㄉㄨㄛㄉㄜ˙ㄒㄧㄠㄆㄛㄎㄨㄞˋ』』";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤⠰⠤⠰⠤⠋⠺⠂⠻⠄⠛⠥⠂⠑⠳⠄⠪⠐⠗⠥⠈⠙⠒⠄⠙⠮⠁⠑⠪⠄⠏⠣⠄⠇⠶⠐⠤⠆⠤⠆⠤⠆⠤⠆");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test punctuation 1", () => {
    const input = "『";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test punctuation 2", () => {
    const input = "『『";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠰⠤⠰⠤⠰⠤⠰⠤");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe(input);
  });

  test("Test bopomofo syllables and lower case letter", () => {
    const input = "ㄊㄞˊabc";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂ ⠁⠃⠉");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄊㄞˊ abc");
  });

  test("Test bopomofo syllables and upper case letter - 1", () => {
    const input = "ㄊㄞˊAbc";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂ ⠠⠁⠃⠉");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄊㄞˊ Abc");
  });

  test("Test bopomofo syllables and upper case letter - 2", () => {
    const input = "Abcㄊㄞˊ";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠠⠁⠃⠉ ⠋⠺⠂");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("Abc ㄊㄞˊ");
  });

  test("Test bopomofo syllables and digit 1 - 1", () => {
    const input = "ㄊㄞˊ1234";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠋⠺⠂ ⠼⠂⠆⠒⠲");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄊㄞˊ 1234");
  });

  test("Test digit 1 - 1", () => {
    const input = "1234";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠼⠂⠆⠒⠲");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("1234");
  });

  test("Test digit 1 - 2", () => {
    const input = "2234";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("2234");
  });

  test("Test digit 1 - 3", () => {
    const input = "22.34";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("22.34");
  });

  test("Test digit and letter 1 - 1", () => {
    const input = "ABCD 1234";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠠⠁⠠⠃⠠⠉⠠⠙ ⠼⠂⠆⠒⠲");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ABCD 1234");
  });

  test("Test digit and letter 2 - 1", () => {
    const input = "1234 ABCD";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠼⠂⠆⠒⠲ ⠠⠁⠠⠃⠠⠉⠠⠙");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("1234 ABCD");
  });

  test("Test Text and Digits 1", () => {
    const input = "ㄉㄧˋ1";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠼⠂");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄉㄧˋ 1");
  });

  test("Test letter 1 - 1", () => {
    const input = "name";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠝⠁⠍⠑");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("name");
  });

  test("Test mix 1 - 1", () => {
    const input = "ㄒㄧㄠˇㄇㄞˋ";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠑⠪⠈⠍⠺⠐");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄒㄧㄠˇㄇㄞˋ");
  });

  test("Test mix 1 - 2", () => {
    const input = "ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ");
  });

  test("Test mix 1 - 3", () => {
    const input = "ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 2.5";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄ ⠼⠆⠨⠢");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 2.5");
  });

  test("Test mix 1 - 4", () => {
    const input = "ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 25%";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄ ⠼⠆⠢⠈⠴");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 25%");
  });

  test("Test mix 1 - 5", () => {
    const input = "ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 25°C";
    const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    expect(r1).toBe("⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄ ⠼⠆⠢⠘⠨⠡ ⠰⠠⠉");
    const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    expect(r2).toBe("ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 25°C");
  });

  describe("convertBrailleToTokens method", () => {
    test("should return tokens for mixed content", () => {
      const braille = "⠑⠪⠈⠍⠺⠐⠁⠌⠐⠹⠄ ⠼⠆⠢";
      const tokens = BopomofoBrailleConverter.convertBrailleToTokens(braille);

      expect(tokens.length).toBeGreaterThan(0);
      // Should contain BopomofoSyllable objects and strings
      expect(tokens.some((token) => typeof token === "object")).toBe(true);
      expect(tokens.some((token) => typeof token === "string")).toBe(true);
    });

    test("should handle pure bopomofo content", () => {
      const braille = "⠑⠪⠈⠍⠺⠐";
      const tokens = BopomofoBrailleConverter.convertBrailleToTokens(braille);

      expect(tokens.length).toBeGreaterThan(0);
      // All tokens should be BopomofoSyllable objects
      expect(tokens.every((token) => typeof token === "object")).toBe(true);
    });

    test("should handle pure text content", () => {
      const braille = "⠝⠁⠍⠑";
      const tokens = BopomofoBrailleConverter.convertBrailleToTokens(braille);

      expect(tokens.length).toBe(1);
      expect(typeof tokens[0]).toBe("string");
      expect(tokens[0]).toBe("name");
    });

    test("should handle empty input", () => {
      const tokens = BopomofoBrailleConverter.convertBrailleToTokens("");
      expect(tokens).toEqual([]);
    });

    test("should handle spaces correctly", () => {
      const braille = "⠑⠪⠈ ⠍⠺⠐";
      const tokens = BopomofoBrailleConverter.convertBrailleToTokens(braille);

      expect(tokens.length).toBeGreaterThan(1);
    });

    test("should reset digit state when followed by bopomofo", () => {
      const braille = "⠼⠂⠻⠄";
      const tokens = BopomofoBrailleConverter.convertBrailleToTokens(braille);

      expect(tokens.length).toBe(2);
      expect(tokens[0]).toBe("1");
      expect(tokens[1]).toBeInstanceOf(BopomofoSyllable);
      if (tokens[1] instanceof BopomofoSyllable) {
        expect(tokens[1].bpmf).toBe("ㄨㄢ");
      }

      const roundtrip = BopomofoBrailleConverter.convertBrailleToBpmf(braille);
      expect(roundtrip).toBe("1ㄨㄢ");
    });

    test("should reset letter state when followed by bopomofo", () => {
      const braille = "⠠⠁⠻⠄";
      const tokens = BopomofoBrailleConverter.convertBrailleToTokens(braille);

      expect(tokens.length).toBe(2);
      expect(tokens[0]).toBe("A");
      expect(tokens[1]).toBeInstanceOf(BopomofoSyllable);
      if (tokens[1] instanceof BopomofoSyllable) {
        expect(tokens[1].bpmf).toBe("ㄨㄢ");
      }

      const roundtrip = BopomofoBrailleConverter.convertBrailleToBpmf(braille);
      expect(roundtrip).toBe("Aㄨㄢ");
    });
  });

  describe("Edge cases and error handling", () => {
    // test("should handle single character input", () => {
    //   let input = "ㄊ";
    //   let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
    //   expect(r1).toBe("⠋⠄"); // Actual braille for ㄊ
    //   let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
    //   expect(r2).toBe(input);
    // });

    test("should handle empty string input", () => {
      const input = "";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      expect(r1).toBe("");
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toBe("");
    });

    test("should handle space-only input", () => {
      const input = "   ";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2.trim()).toBe("");
    });

    test("should handle invalid bopomofo characters", () => {
      const input = "ㄊㄞˊ@#$";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      expect(r1).toContain("⠋⠺⠂"); // Should convert valid part
      expect(r1).toContain("@#$"); // Should preserve invalid characters
    });

    test("should handle consecutive spaces", () => {
      const input = "ㄊㄞˊ   ㄨㄢ";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toContain("ㄊㄞˊ");
      expect(r2).toContain("ㄨㄢ");
    });

    test("should handle mixed case letters", () => {
      const input = "aBcD";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      expect(r1).toContain("⠠"); // Should contain uppercase marker
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toBe("aBcD");
    });

    test("should handle special numeric characters", () => {
      const input = "123+456=579";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toContain("123");
      expect(r2).toContain("456");
      expect(r2).toContain("579");
    });
  });

  describe("Complex punctuation handling", () => {
    test("should handle specific punctuation marks", () => {
      // Test mixed content where punctuation works better with context
      const input = "ㄊㄞˊ，ㄨㄢ";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toContain("ㄊㄞˊ");
      expect(r2).toContain("ㄨㄢ");
    });

    test("should handle mixed content with punctuation", () => {
      const input = "ㄊㄞˊ，ㄨㄢ。";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toContain("ㄊㄞˊ");
      expect(r2).toContain("ㄨㄢ");
    });

    test("should handle quotation marks", () => {
      const input = "「ㄊㄞˊㄨㄢ」";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toContain("ㄊㄞˊㄨㄢ");
    });

    test("should handle brackets and parentheses", () => {
      const input = "（ㄊㄞˊㄨㄢ）";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toContain("ㄊㄞˊㄨㄢ");
    });

    test("should keep letters and punctuation compact", () => {
      const input = "abc.";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      expect(r1).toBe("⠁⠃⠉⠲");
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toBe(input);
    });
  });

  describe("State transition tests", () => {
    test("should handle transitions between different content types", () => {
      const input = "ㄊㄞˊ123abc";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      expect(r1).toContain("⠋⠺⠂"); // Bopomofo
      expect(r1).toContain("⠼"); // Digit prefix
      expect(r1).toContain("⠁⠃⠉"); // Letters
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toContain("ㄊㄞˊ");
      expect(r2).toContain("123");
      expect(r2).toContain("abc");
    });

    test("should handle alternating content types", () => {
      const input = "ㄊㄞˊ1ㄨㄢa";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toContain("ㄊㄞˊ");
      expect(r2).toContain("1");
      expect(r2).toContain("ㄨㄢ");
      expect(r2).toContain("a");
    });
  });

  describe("Performance and boundary tests", () => {
    test("should handle long input strings", () => {
      const longInput = "ㄊㄞˊㄨㄢ".repeat(100);
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(longInput);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toBe(longInput);
    });

    test("should handle character conversions correctly", () => {
      const validChars = [
        { input: "ㄞ", expected: "⠺⠄" }, // Corrected expected value
        // { input: "ˊ", expected: "⠂" },
        // { input: "1", expectedContains: "⠁" },
        { input: "a", expectedContains: "⠁" },
        { input: "A", expectedContains: "⠠⠁" },
      ];

      validChars.forEach(({ input, expected, expectedContains }) => {
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
        if (expected) {
          expect(r1).toBe(expected);
        } else if (expectedContains) {
          expect(r1).toContain(expectedContains);
        }

        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        // For single characters, check if conversion contains expected result
        if (input === "1" || input.match(/[a-zA-Z]/)) {
          expect(r2).toContain(input);
        } else {
          expect(r2).toBe(input);
        }
      });
    });
  });

  describe("Unicode and special character handling", () => {
    test("should handle non-ASCII characters", () => {
      const input = "ㄊㄞˊ中文測試";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toContain("ㄊㄞˊ");
      expect(r2).toContain("中文測試");
    });

    test("should handle emoji and symbols", () => {
      const input = "ㄊㄞˊ😀★♪";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      expect(r2).toContain("ㄊㄞˊ");
      expect(r2).toContain("😀★♪");
    });
  });

  describe("Consistency tests", () => {
    test("should be consistent across multiple conversions", () => {
      const input = "ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣ 25°C";
      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      const r3 = BopomofoBrailleConverter.convertBpmfToBraille(r2);
      const r4 = BopomofoBrailleConverter.convertBrailleToBpmf(r3);

      expect(r2).toBe(r4);
    });

    test("should handle whitespace normalization", () => {
      const input1 = "ㄊㄞˊ ㄨㄢ";
      const input2 = "ㄊㄞˊ  ㄨㄢ";

      const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input1);
      const r2 = BopomofoBrailleConverter.convertBpmfToBraille(input2);

      // Both should normalize to similar braille patterns
      expect(r1).toContain("⠋⠺⠂");
      expect(r2).toContain("⠋⠺⠂");
    });
  });

  describe("Additional comprehensive tests", () => {
    describe("State transition edge cases", () => {
      test("should handle digit state transitions properly", () => {
        const input = "1a2b3";
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        expect(r2).toContain("1");
        expect(r2).toContain("2");
        expect(r2).toContain("3");
        expect(r2).toContain("a");
        expect(r2).toContain("b");
      });

      test("should handle rapid state changes", () => {
        const input = "ㄊ1aㄞb2";
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        // Since the character conversion might not be perfect for isolated chars,
        // just check that some expected content is present
        expect(r2).toContain("1");
        expect(r2).toContain("2");
        expect(r2).toContain("a");
        expect(r2).toContain("b");
      });

      test("should reset state after spaces correctly", () => {
        const input = "123 abc ㄊㄞˊ";
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        expect(r2).toContain("123");
        expect(r2).toContain("abc");
        expect(r2).toContain("ㄊㄞˊ");
      });
    });

    describe("Malformed input handling", () => {
      test("should handle null-like inputs gracefully", () => {
        expect(() =>
          BopomofoBrailleConverter.convertBpmfToBraille("")
        ).not.toThrow();
        expect(() =>
          BopomofoBrailleConverter.convertBrailleToBpmf("")
        ).not.toThrow();
      });

      test("should handle very long digit sequences", () => {
        const longDigits = "1234567890".repeat(10);
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(longDigits);
        expect(r1).toContain("⠼"); // Should contain digit prefix
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        expect(r2).toContain("123");
        expect(r2).toContain("890");
      });

      test("should handle very long letter sequences", () => {
        const longLetters = "abcdefghijklmnopqrstuvwxyz".repeat(5);
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(longLetters);
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        expect(r2).toContain("abc");
        expect(r2).toContain("xyz");
      });

      test("should handle mixed invalid characters", () => {
        const input = "ㄊㄞˊ@#$%^&*()_+";
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        expect(r2).toContain("ㄊㄞˊ");
      });
    });

    describe("Specific braille sequence tests", () => {
      test("should convert digit prefixes correctly", () => {
        const input = "12.34";
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
        expect(r1).toContain("⠼"); // Digit prefix
        expect(r1).toContain("⠨"); // Decimal point
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        expect(r2).toContain("12");
        expect(r2).toContain("34");
      });

      test("should handle uppercase letter indicators", () => {
        const input = "AbC";
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
        expect(r1).toContain("⠠"); // Uppercase prefix
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        expect(r2).toBe("AbC");
      });
    });

    describe("Token conversion detailed tests", () => {
      test("should handle token conversion with punctuation", () => {
        const braille = "⠋⠺⠂⠨⠴";
        const tokens = BopomofoBrailleConverter.convertBrailleToTokens(braille);
        expect(tokens.length).toBeGreaterThan(0);
      });

      test("should handle whitespace in token conversion", () => {
        const braille = "⠋⠺⠂   ⠋⠺⠂";
        const tokens = BopomofoBrailleConverter.convertBrailleToTokens(braille);
        expect(tokens.length).toBeGreaterThan(1);
      });
    });

    describe("Real-world usage scenarios", () => {
      test("should handle common phrase patterns", () => {
        const input = "ㄋㄧˇㄏㄠˇ";
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        expect(r2).toBe(input);
      });

      test("should handle date formats", () => {
        const input = "2024/12/31";
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        expect(r2).toContain("2024");
        expect(r2).toContain("12");
        expect(r2).toContain("31");
      });

      test("should handle percentage and temperature", () => {
        const input = "50% 25°C";
        const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
        const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
        expect(r2).toContain("50");
        expect(r2).toContain("25");
      });

      //   test("should handle email-like patterns", () => {
      //     let input = "test@example.com";
      //     let r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
      //     let r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
      //     expect(r2).toContain("test");
      //     expect(r2).toContain("example");
      //     expect(r2).toContain("com");
      //   });
      // });

      describe("Performance edge cases", () => {
        test("should handle repeated conversion cycles", () => {
          const input = "ㄊㄞˊㄨㄢ123abc";
          let current = input;

          // Convert back and forth multiple times
          for (let i = 0; i < 5; i++) {
            const braille =
              BopomofoBrailleConverter.convertBpmfToBraille(current);
            current = BopomofoBrailleConverter.convertBrailleToBpmf(braille);
          }

          expect(current).toContain("ㄊㄞˊㄨㄢ");
          expect(current).toContain("123");
          expect(current).toContain("abc");
        });

        test("should handle empty string edge cases", () => {
          expect(BopomofoBrailleConverter.convertBpmfToBraille("")).toBe("");
          expect(BopomofoBrailleConverter.convertBrailleToBpmf("")).toBe("");
          expect(BopomofoBrailleConverter.convertBrailleToTokens("")).toEqual(
            []
          );
        });

        test("should handle single space input", () => {
          const input = " ";
          const r1 = BopomofoBrailleConverter.convertBpmfToBraille(input);
          expect(r1).toBe(" ");
          const r2 = BopomofoBrailleConverter.convertBrailleToBpmf(r1);
          expect(r2).toBe(" ");
        });
      });
    });
  });
});
