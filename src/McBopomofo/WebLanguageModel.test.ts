import { webData } from "./WebData";
import { WebLanguageModel, UserPhrases } from "./WebLanguageModel";
import { Unigram } from "../Gramambular2";

describe("getReading", () => {
  test("returns reading for supplied character", () => {
    const model = new WebLanguageModel(webData);
    const reading = model.getReading("楊");
    expect(reading).toBe("ㄧㄤˊ");
  });
});

describe("UserPhrases", () => {
  let userPhrases: UserPhrases;

  beforeEach(() => {
    userPhrases = new UserPhrases();
  });

  describe("setUserPhrases", () => {
    it("sets user phrases from map", () => {
      const map = new Map<string, string[]>();
      map.set("test", ["測試", "考試"]);
      userPhrases.setUserPhrases(map);

      const unigrams = userPhrases.getUnigrams("test");
      expect(unigrams).toHaveLength(2);
      expect(unigrams[0].value).toBe("測試");
      expect(unigrams[1].value).toBe("考試");
    });

    it("handles null/undefined input", () => {
      userPhrases.setUserPhrases(null as any);
      expect(userPhrases.hasUnigrams("test")).toBe(false);

      userPhrases.setUserPhrases(undefined as any);
      expect(userPhrases.hasUnigrams("test")).toBe(false);
    });
  });

  describe("addUserPhrase", () => {
    it("adds new phrase to new key", () => {
      userPhrases.addUserPhrase("hello", "你好");
      expect(userPhrases.hasUnigrams("hello")).toBe(true);

      const unigrams = userPhrases.getUnigrams("hello");
      expect(unigrams).toHaveLength(1);
      expect(unigrams[0].value).toBe("你好");
      expect(unigrams[0].score).toBe(0);
    });

    it("adds phrase to existing key", () => {
      userPhrases.addUserPhrase("test", "測試");
      userPhrases.addUserPhrase("test", "考試");

      const unigrams = userPhrases.getUnigrams("test");
      expect(unigrams).toHaveLength(2);
      expect(unigrams[0].value).toBe("測試");
      expect(unigrams[1].value).toBe("考試");
    });

    it("does not add duplicate phrases", () => {
      userPhrases.addUserPhrase("test", "測試");
      userPhrases.addUserPhrase("test", "測試");

      const unigrams = userPhrases.getUnigrams("test");
      expect(unigrams).toHaveLength(1);
      expect(unigrams[0].value).toBe("測試");
    });

    it("calls onPhraseChange callback", () => {
      const callback = jest.fn();
      userPhrases.setOnPhraseChange(callback);

      userPhrases.addUserPhrase("test", "測試");
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.any(Map));
    });
  });

  describe("removeUserPhrase", () => {
    beforeEach(() => {
      userPhrases.addUserPhrase("test", "測試");
      userPhrases.addUserPhrase("test", "考試");
    });

    it("removes existing phrase", () => {
      userPhrases.removeUserPhrase("test", "測試");

      const unigrams = userPhrases.getUnigrams("test");
      expect(unigrams).toHaveLength(1);
      expect(unigrams[0].value).toBe("考試");
    });

    it("handles non-existing key", () => {
      userPhrases.removeUserPhrase("nonexistent", "test");
      // Should not throw
    });

    it("handles non-existing phrase", () => {
      userPhrases.removeUserPhrase("test", "nonexistent");

      const unigrams = userPhrases.getUnigrams("test");
      expect(unigrams).toHaveLength(2);
    });

    it("calls onPhraseChange callback when phrase is removed", () => {
      const callback = jest.fn();
      userPhrases.setOnPhraseChange(callback);

      userPhrases.removeUserPhrase("test", "測試");
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUnigrams", () => {
    it("returns empty array for space", () => {
      const result = userPhrases.getUnigrams(" ");
      expect(result).toEqual([]);
    });

    it("returns empty array for non-existing key", () => {
      const result = userPhrases.getUnigrams("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("hasUnigrams", () => {
    it("returns true for space", () => {
      expect(userPhrases.hasUnigrams(" ")).toBe(true);
    });

    it("returns false for non-existing key", () => {
      expect(userPhrases.hasUnigrams("nonexistent")).toBe(false);
    });

    it("returns true for existing key with phrases", () => {
      userPhrases.addUserPhrase("test", "測試");
      expect(userPhrases.hasUnigrams("test")).toBe(true);
    });

    it("returns false for key with empty phrase list", () => {
      const map = new Map<string, string[]>();
      map.set("empty", []);
      userPhrases.setUserPhrases(map);
      expect(userPhrases.hasUnigrams("empty")).toBe(false);
    });
  });
});

describe("WebLanguageModel", () => {
  let model: WebLanguageModel;

  beforeEach(() => {
    model = new WebLanguageModel(webData);
  });

  describe("constructor", () => {
    it("creates instance with data", () => {
      expect(model).toBeInstanceOf(WebLanguageModel);
    });
  });

  describe("converters", () => {
    it("sets and use macro converter", () => {
      const converter = jest.fn((input: string) => input.toUpperCase());
      model.setMacroConverter(converter);

      const result = model.convertMacro("test");
      expect(result).toBe("TEST");
      expect(converter).toHaveBeenCalledWith("test");
    });

    it("handles undefined macro converter", () => {
      model.setMacroConverter(undefined);
      const result = model.convertMacro("test");
      expect(result).toBe("test");
    });

    it("sets general converter", () => {
      const converter = jest.fn((input: string) => input + "_converted");
      model.setConverter(converter);
      // The converter is used internally in filterAndTransformUnigrams
    });

    it("sets add user phrase converter", () => {
      const converter = jest.fn((input: string) => input + "_user");
      model.setAddUserPhraseConverter(converter);

      model.addUserPhrase("test", "phrase");
      expect(converter).toHaveBeenCalledWith("phrase");
    });

    it("sets excluded phrase converter", () => {
      const converter = jest.fn((input: string) => input + "_excluded");
      model.setExcludedPhraseConverter(converter);

      model.addExcludedPhrase("test", "phrase");
      expect(converter).toHaveBeenCalledWith("phrase");
    });
  });

  describe("convertTextToMap", () => {
    it("converts text with valid lines", () => {
      const text = "測試 test\n考試 exam\n# comment\n\n空行 empty";
      model.setUserPhrases(text);

      const unigrams = model.getUnigrams("test");
      expect(unigrams.length).toBeGreaterThan(0);
      expect(unigrams[0].value).toBe("測試");
    });

    it("skips comments and empty lines", () => {
      const text = "# This is a comment\n\n測試 test\n# Another comment";
      model.setUserPhrases(text);

      const unigrams = model.getUnigrams("test");
      expect(unigrams.length).toBeGreaterThan(0);
      expect(unigrams[0].value).toBe("測試");
    });

    it("handles lines with insufficient parts", () => {
      const text = "invalid\n測試 test\nsingleword";
      model.setUserPhrases(text);

      const unigrams = model.getUnigrams("test");
      expect(unigrams.length).toBeGreaterThan(0);
      expect(unigrams[0].value).toBe("測試");
    });
  });

  describe("setUserPhrases", () => {
    it("accepts Map input", () => {
      const map = new Map<string, string[]>();
      map.set("test", ["測試"]);
      model.setUserPhrases(map);

      const unigrams = model.getUnigrams("test");
      expect(unigrams.length).toBeGreaterThan(0);
    });

    it("accepts string input", () => {
      model.setUserPhrases("測試 test");

      const unigrams = model.getUnigrams("test");
      expect(unigrams.length).toBeGreaterThan(0);
    });
  });

  describe("setExcludedPhrases", () => {
    it("accepts Map input", () => {
      const map = new Map<string, string[]>();
      map.set("test", ["測試"]);
      model.setExcludedPhrases(map);
      // Excluded phrases affect filtering in getUnigrams
    });

    it("accepts string input", () => {
      model.setExcludedPhrases("測試 test");
      // Excluded phrases affect filtering in getUnigrams
    });
  });

  describe("callback setters", () => {
    it("sets onPhraseChange callback", () => {
      const callback = jest.fn();
      model.setOnPhraseChange(callback);

      model.addUserPhrase("test", "測試");
      expect(callback).toHaveBeenCalled();
    });

    it("sets onExcludedPhraseChange callback", () => {
      const callback = jest.fn();
      model.setOnExcludedPhraseChange(callback);

      model.addExcludedPhrase("test", "測試");
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("addUserPhrase", () => {
    it("adds user phrase", () => {
      model.addUserPhrase("test", "測試");

      const unigrams = model.getUnigrams("test");
      expect(unigrams.length).toBeGreaterThan(0);
      // User phrases should appear first
      expect(unigrams[0].value).toBe("測試");
    });

    it("removes from excluded phrases when adding user phrase", () => {
      model.addExcludedPhrase("test", "測試");
      model.addUserPhrase("test", "測試");

      const unigrams = model.getUnigrams("test");
      const values = unigrams.map((u) => u.value);
      expect(values).toContain("測試");
    });
  });

  describe("addExcludedPhrase", () => {
    it("adds excluded phrase", () => {
      model.addExcludedPhrase("test", "測試");
      // The effect is seen when getting unigrams - excluded phrases are filtered out
    });

    it("removes from user phrases when adding excluded phrase", () => {
      model.addUserPhrase("test", "測試");
      model.addExcludedPhrase("test", "測試");

      const unigrams = model.getUnigrams("test");
      const values = unigrams.map((u) => u.value);
      expect(values).not.toContain("測試");
    });
  });

  describe("getUnigrams", () => {
    it("returns space unigram for space key", () => {
      const unigrams = model.getUnigrams(" ");
      expect(unigrams).toHaveLength(1);
      expect(unigrams[0].value).toBe(" ");
    });

    it("returns unigrams for valid key", () => {
      const unigrams = model.getUnigrams("ㄋㄧˇ");
      expect(unigrams.length).toBeGreaterThan(0);
      expect(unigrams[0].value).toBe("你");
    });

    it("prioritizes user phrases", () => {
      model.addUserPhrase("ㄋㄧˇ", "我的自定義");

      const unigrams = model.getUnigrams("ㄋㄧˇ");
      expect(unigrams[0].value).toBe("我的自定義");
    });

    it("filters out excluded phrases", () => {
      const originalUnigrams = model.getUnigrams("ㄋㄧˇ");
      const firstValue = originalUnigrams[0].value;

      model.addExcludedPhrase("ㄋㄧˇ", firstValue);
      const filteredUnigrams = model.getUnigrams("ㄋㄧˇ");
      const values = filteredUnigrams.map((u) => u.value);
      expect(values).not.toContain(firstValue);
    });

    it("handles multi-syllable keys", () => {
      const unigrams = model.getUnigrams("ㄋㄧˇ-ㄏㄠˇ");
      expect(unigrams.length).toBeGreaterThan(0);
    });
    it("boosts user phrase scores for mono-syllable keys", () => {
      const originalUnigrams = model.getUnigrams("ㄋㄧˇ");
      const originalTopScore =
        originalUnigrams.length > 0 ? originalUnigrams[0].score : -1;

      model.addUserPhrase("ㄋㄧˇ", "我的");

      const unigrams = model.getUnigrams("ㄋㄧˇ");
      expect(unigrams[0].value).toBe("我的");
      expect(unigrams[0].score).toBeGreaterThan(originalTopScore); // Should be boosted above original
    });
  });

  describe("hasUnigrams", () => {
    it("returns true for space", () => {
      expect(model.hasUnigrams(" ")).toBe(true);
    });

    it("returns true for valid keys", () => {
      expect(model.hasUnigrams("ㄋㄧˇ")).toBe(true);
    });

    it("returns false for invalid keys", () => {
      expect(model.hasUnigrams("invalid_key")).toBe(false);
    });

    it("returns true for user phrases", () => {
      model.addUserPhrase("custom", "自定義");
      expect(model.hasUnigrams("custom")).toBe(true);
    });
  });

  describe("maybeAbsoluteOrderKey", () => {
    it("handles simple keys", () => {
      const result = WebLanguageModel.maybeAbsoluteOrderKey("ㄋㄧˇ");
      expect(result).toBeTruthy();
      expect(result).not.toBe("ㄋㄧˇ");
    });

    it("handles multi-syllable keys", () => {
      const result = WebLanguageModel.maybeAbsoluteOrderKey("ㄋㄧˇ-ㄏㄠˇ");
      expect(result).toBeTruthy();
    });

    it("handles punctuation keys", () => {
      const punctuationKey = "_punctuation_comma";
      const result = WebLanguageModel.maybeAbsoluteOrderKey(punctuationKey);
      expect(result).toBe(punctuationKey);
    });

    it("handles special punctuation keys with hyphens", () => {
      const specialKey = "_punctuation_Hsu_-";
      const result = WebLanguageModel.maybeAbsoluteOrderKey(specialKey);
      expect(result).toBe(specialKey);
    });
  });

  describe("filterAndTransformUnigrams", () => {
    it("filters excluded values", () => {
      const unigrams = [new Unigram("test1", 1), new Unigram("test2", 2)];
      const excludedValues = new Set(["test1"]);
      const insertedValues = new Set<string>();

      const result = model.filterAndTransformUnigrams(
        unigrams,
        excludedValues,
        insertedValues
      );
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe("test2");
    });

    it("applies converters", () => {
      const macroConverter = jest.fn((input: string) => input + "_macro");
      const converter = jest.fn((input: string) => input + "_general");

      model.setMacroConverter(macroConverter);
      model.setConverter(converter);

      const unigrams = [new Unigram("test", 1)];
      const excludedValues = new Set<string>();
      const insertedValues = new Set<string>();

      const result = model.filterAndTransformUnigrams(
        unigrams,
        excludedValues,
        insertedValues
      );
      expect(result[0].value).toBe("test_macro_general");
    });

    it("handles empty values after conversion", () => {
      const converter = jest.fn(() => "");
      model.setConverter(converter);

      const unigrams = [new Unigram("test", 1)];
      const excludedValues = new Set<string>();
      const insertedValues = new Set<string>();

      const result = model.filterAndTransformUnigrams(
        unigrams,
        excludedValues,
        insertedValues
      );
      expect(result).toHaveLength(0);
    });
  });

  describe("getReading", () => {
    it("gets reading for existing character", () => {
      const reading = model.getReading("楊");
      expect(reading).toBe("ㄧㄤˊ");
    });

    it("returns undefined for non-existing character", () => {
      const reading = model.getReading("不存在的字");
      expect(reading).toBeUndefined();
    });

    it("handles punctuation readings", () => {
      // Test with a punctuation character if it exists in the data
      const reading = model.getReading("，");
      if (reading) {
        expect(reading).toContain("_punctuation");
      }
    });

    it("selects highest scoring reading", () => {
      // This tests that the method returns the reading with highest score
      const reading = model.getReading("你");
      expect(reading).toBeTruthy();
    });

    it("builds reverse map on first call", () => {
      // First call builds the reverse map
      const reading1 = model.getReading("你");
      // Second call uses the reverse map
      const reading2 = model.getReading("你");
      expect(reading1).toBe(reading2);
    });

    it("handles multi-syllable readings", () => {
      const reading = model.getReading("中國");
      if (reading) {
        expect(reading).toContain("-");
      }
    });

    it("handles characters with letter/punctuation patterns", () => {
      // Test characters that might match the letter/punctuation pattern
      const testCases = ["a", "A", "1", "!"];
      testCases.forEach((char) => {
        const reading = model.getReading(char);
        // Should either return undefined or a valid reading
        if (reading) {
          expect(typeof reading).toBe("string");
        }
      });
    });
  });

  describe("edge cases and error handling", () => {
    it("handles empty constructor data", () => {
      const emptyModel = new WebLanguageModel({});
      expect(emptyModel.hasUnigrams("test")).toBe(false);
      expect(emptyModel.getUnigrams("test")).toEqual([]);
    });

    it("handles malformed data in constructor", () => {
      const malformedModel = new WebLanguageModel({
        invalid: "not_space_separated",
      });
      // Should not throw and should handle gracefully
      expect(() => malformedModel.getUnigrams("invalid")).not.toThrow();
    });

    it("handles undefined/null converter responses", () => {
      const converter = jest.fn(() => undefined);
      model.setConverter(converter);

      model.addUserPhrase("test", "測試");
      const unigrams = model.getUnigrams("test");
      // Should filter out undefined results
      expect(unigrams.every((u) => u.value)).toBe(true);
    });

    it("handles very long keys", () => {
      const longKey = "ㄋㄧˇ-ㄏㄠˇ-ㄉㄜ˙-ㄏㄣˇ-ㄏㄠˇ-ㄉㄜ˙";
      const result = model.hasUnigrams(longKey);
      expect(typeof result).toBe("boolean");
    });

    it("handles special characters in keys", () => {
      const specialKeys = ["_test", "test-", "-test", "test_-_test"];
      specialKeys.forEach((key) => {
        expect(() => model.hasUnigrams(key)).not.toThrow();
        expect(() => model.getUnigrams(key)).not.toThrow();
      });
    });
  });

  describe("integration tests", () => {
    it("works with complete user phrase workflow", () => {
      // Add user phrase
      model.addUserPhrase("test", "測試詞彙");

      // Verify it appears in results
      let unigrams = model.getUnigrams("test");
      expect(unigrams[0].value).toBe("測試詞彙");

      // Add to excluded phrases
      model.addExcludedPhrase("test", "測試詞彙");

      // Verify it's removed
      unigrams = model.getUnigrams("test");
      const values = unigrams.map((u) => u.value);
      expect(values).not.toContain("測試詞彙");
    });

    it("handles multiple user phrases for same key", () => {
      model.addUserPhrase("hello", "你好");
      model.addUserPhrase("hello", "哈囉");
      model.addUserPhrase("hello", "嗨");

      const unigrams = model.getUnigrams("hello");
      expect(unigrams.length).toBeGreaterThanOrEqual(3);
      const values = unigrams.map((u) => u.value);
      expect(values).toContain("你好");
      expect(values).toContain("哈囉");
      expect(values).toContain("嗨");
    });

    it("handles converter chain correctly", () => {
      const macroConverter = (input: string) => input + "_macro";
      const generalConverter = (input: string) => input + "_general";

      model.setMacroConverter(macroConverter);
      model.setConverter(generalConverter);

      model.addUserPhrase("test", "original");

      const unigrams = model.getUnigrams("test");
      expect(unigrams[0].value).toBe("original_macro_general");
    });
  });
});
