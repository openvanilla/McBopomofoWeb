import { LocalizedStrings } from "./LocalizedStrings";

describe("LocalizedStrings", () => {
  let localizedStrings: LocalizedStrings;

  beforeEach(() => {
    localizedStrings = new LocalizedStrings();
  });

  describe("lookUp", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.lookUp("測試", "字典");
      expect(result).toBe("在「字典」查找「測試」");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.lookUp("test", "dictionary");
      expect(result).toBe('Look up "test" in dictionary');
    });

    it("should return English text when languageCode is empty", () => {
      localizedStrings.languageCode = "";
      const result = localizedStrings.lookUp("test", "dictionary");
      expect(result).toBe('Look up "test" in dictionary');
    });
  });

  describe("cursorIsBetweenSyllables", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.cursorIsBetweenSyllables("ㄅㄛ", "ㄆㄛ");
      expect(result).toBe("游標正在 ㄅㄛ 與 ㄆㄛ 之間");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.cursorIsBetweenSyllables("bo", "po");
      expect(result).toBe("Cursor is between syllables bo and po.");
    });
  });

  describe("syllablesRequired", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.syllablesRequired(3);
      expect(result).toBe("最少需要 3 字元");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.syllablesRequired(5);
      expect(result).toBe("5 syllables required.");
    });

    it("should handle zero count", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.syllablesRequired(0);
      expect(result).toBe("0 syllables required.");
    });
  });

  describe("syllableMaximum", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.syllableMaximum(10);
      expect(result).toBe("最多只能 10 字元");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.syllableMaximum(8);
      expect(result).toBe("8 syllables maximum");
    });
  });

  describe("phraseAlreadyExists", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.phraseAlreadyExists();
      expect(result).toBe("詞彙已存在");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.phraseAlreadyExists();
      expect(result).toBe("phrase already exists");
    });
  });

  describe("pressEnterToAddThePhrase", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.pressEnterToAddThePhrase();
      expect(result).toBe("按下 Enter 加入詞彙");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.pressEnterToAddThePhrase();
      expect(result).toBe("press Enter to add the phrase");
    });
  });

  describe("markedWithSyllablesAndStatus", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.markedWithSyllablesAndStatus(
        "測試",
        "ㄘㄜˋ ㄕˋ",
        "完成"
      );
      expect(result).toBe("已選取： 測試， 注音: ㄘㄜˋ ㄕˋ，完成");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.markedWithSyllablesAndStatus(
        "test",
        "ce shi",
        "completed"
      );
      expect(result).toBe("Marked: test, syllables: ce shi, completed");
    });

    it("should handle empty strings", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.markedWithSyllablesAndStatus("", "", "");
      expect(result).toBe("Marked: , syllables: , ");
    });
  });

  describe("boostTitle", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.boostTitle("測試詞彙");
      expect(result).toBe("您想要增加「測試詞彙」這個詞彙的權重嗎？");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.boostTitle("test phrase");
      expect(result).toBe('Do you wan to boost the phrase "test phrase"?');
    });

    it("should handle empty phrase", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.boostTitle("");
      expect(result).toBe('Do you wan to boost the phrase ""?');
    });
  });

  describe("excludeTitle", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.excludeTitle("測試詞彙");
      expect(result).toBe("您想要排除「測試詞彙」這個詞彙嗎？？");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.excludeTitle("test phrase");
      expect(result).toBe('Do you wan to exclude the phrase "test phrase"?');
    });

    it("should handle empty phrase", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.excludeTitle("");
      expect(result).toBe('Do you wan to exclude the phrase ""?');
    });
  });

  describe("boost", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.boost();
      expect(result).toBe("增加權重");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.boost();
      expect(result).toBe("Boost");
    });
  });

  describe("exclude", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.exclude();
      expect(result).toBe("排除");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.exclude();
      expect(result).toBe("Exclude");
    });
  });

  describe("cancel", () => {
    it("should return Chinese text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.cancel();
      expect(result).toBe("取消");
    });

    it("should return English text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.cancel();
      expect(result).toBe("Cancel");
    });
  });

  describe("languageCode property", () => {
    it("should default to empty string", () => {
      const newInstance = new LocalizedStrings();
      expect(newInstance.languageCode).toBe("");
    });

    it("should be settable", () => {
      localizedStrings.languageCode = "zh-TW";
      expect(localizedStrings.languageCode).toBe("zh-TW");
    });
  });

  describe("edge cases", () => {
    it("should handle undefined languageCode gracefully", () => {
      // @ts-ignore - Testing edge case
      localizedStrings.languageCode = undefined;
      const result = localizedStrings.boost();
      expect(result).toBe("Boost"); // Should default to English
    });

    it("should handle null languageCode gracefully", () => {
      // @ts-ignore - Testing edge case
      localizedStrings.languageCode = null;
      const result = localizedStrings.cancel();
      expect(result).toBe("Cancel"); // Should default to English
    });

    it("should handle different Chinese language codes", () => {
      localizedStrings.languageCode = "zh-CN";
      const result = localizedStrings.boost();
      expect(result).toBe("Boost"); // Should default to English for non zh-TW
    });
  });
});
