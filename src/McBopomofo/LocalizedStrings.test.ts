import { LocalizedStrings } from "./LocalizedStrings";

describe("LocalizedStrings", () => {
  let localizedStrings: LocalizedStrings;

  beforeEach(() => {
    localizedStrings = new LocalizedStrings();
  });

  describe("lookUp", () => {
    it("returns zh-TW lookup string when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.lookUp("測試", "字典");
      expect(result).toBe("在「字典」查找「測試」");
    });

    it("returns English lookup string when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.lookUp("test", "dictionary");
      expect(result).toBe('Look up "test" in dictionary');
    });

    it("defaults lookUp to English when languageCode is empty", () => {
      localizedStrings.languageCode = "";
      const result = localizedStrings.lookUp("test", "dictionary");
      expect(result).toBe('Look up "test" in dictionary');
    });
  });

  describe("speak", () => {
    it("returns zh-TW speak text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      expect(localizedStrings.speak("測試")).toBe("朗讀「測試」");
    });

    it("returns English speak text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      expect(localizedStrings.speak("test")).toBe('Speak "test"');
    });
  });

  describe("characterInfo", () => {
    it("returns zh-TW character info text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      expect(localizedStrings.characterInfo()).toBe("字元資訊");
    });

    it("returns English character info text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      expect(localizedStrings.characterInfo()).toBe("Character Information");
    });
  });

  describe("cursorIsBetweenSyllables", () => {
    it("reports zh-TW cursor guidance when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.cursorIsBetweenSyllables("ㄅㄛ", "ㄆㄛ");
      expect(result).toBe("游標正在 ㄅㄛ 與 ㄆㄛ 之間");
    });

    it("reports English cursor guidance when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.cursorIsBetweenSyllables("bo", "po");
      expect(result).toBe("Cursor is between syllables bo and po.");
    });
  });

  describe("syllablesRequired", () => {
    it("returns zh-TW minimum syllable text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.syllablesRequired(3);
      expect(result).toBe("最少需要 3 字元");
    });

    it("returns English minimum syllable text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.syllablesRequired(5);
      expect(result).toBe("5 syllables required.");
    });

    it("describes zero syllable requirement in English", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.syllablesRequired(0);
      expect(result).toBe("0 syllables required.");
    });
  });

  describe("syllableMaximum", () => {
    it("returns zh-TW maximum syllable text when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.syllableMaximum(10);
      expect(result).toBe("最多只能 10 字元");
    });

    it("returns English maximum syllable text when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.syllableMaximum(8);
      expect(result).toBe("8 syllables maximum");
    });
  });

  describe("phraseAlreadyExists", () => {
    it("shows zh-TW duplicate phrase warning when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.phraseAlreadyExists();
      expect(result).toBe("詞彙已存在");
    });

    it("shows English duplicate phrase warning when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.phraseAlreadyExists();
      expect(result).toBe("phrase already exists");
    });
  });

  describe("pressEnterToAddThePhrase", () => {
    it("prompts zh-TW enter-to-add message when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.pressEnterToAddThePhrase();
      expect(result).toBe("按下 Enter 加入詞彙");
    });

    it("prompts English enter-to-add message when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.pressEnterToAddThePhrase();
      expect(result).toBe("press Enter to add the phrase");
    });
  });

  describe("markedWithSyllablesAndStatus", () => {
    it("describes marked entry in zh-TW when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.markedWithSyllablesAndStatus(
        "測試",
        "ㄘㄜˋ ㄕˋ",
        "完成"
      );
      expect(result).toBe("已選取： 測試， 注音: ㄘㄜˋ ㄕˋ，完成");
    });

    it("describes marked entry in English when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.markedWithSyllablesAndStatus(
        "test",
        "ce shi",
        "completed"
      );
      expect(result).toBe("Marked: test, syllables: ce shi, completed");
    });

    it("handles empty values when describing marked entry", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.markedWithSyllablesAndStatus("", "", "");
      expect(result).toBe("Marked: , syllables: , ");
    });
  });

  describe("boostTitle", () => {
    it("asks in zh-TW whether to boost a phrase", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.boostTitle("測試詞彙");
      expect(result).toBe("您想要增加「測試詞彙」這個詞彙的權重嗎？");
    });

    it("asks in English whether to boost a phrase", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.boostTitle("test phrase");
      expect(result).toBe('Do you wan to boost the phrase "test phrase"?');
    });

    it("handles empty phrase when asking to boost", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.boostTitle("");
      expect(result).toBe('Do you wan to boost the phrase ""?');
    });
  });

  describe("excludeTitle", () => {
    it("asks in zh-TW whether to exclude a phrase", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.excludeTitle("測試詞彙");
      expect(result).toBe("您想要排除「測試詞彙」這個詞彙嗎？？");
    });

    it("asks in English whether to exclude a phrase", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.excludeTitle("test phrase");
      expect(result).toBe('Do you wan to exclude the phrase "test phrase"?');
    });

    it("handles empty phrase when asking to exclude", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.excludeTitle("");
      expect(result).toBe('Do you wan to exclude the phrase ""?');
    });
  });

  describe("boost", () => {
    it("returns zh-TW boost button label when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.boost();
      expect(result).toBe("增加權重");
    });

    it("returns English boost button label when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.boost();
      expect(result).toBe("Boost");
    });
  });

  describe("exclude", () => {
    it("returns zh-TW exclude button label when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.exclude();
      expect(result).toBe("排除");
    });

    it("returns English exclude button label when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.exclude();
      expect(result).toBe("Exclude");
    });
  });

  describe("cancel", () => {
    it("returns zh-TW cancel button label when languageCode is zh-TW", () => {
      localizedStrings.languageCode = "zh-TW";
      const result = localizedStrings.cancel();
      expect(result).toBe("取消");
    });

    it("returns English cancel button label when languageCode is not zh-TW", () => {
      localizedStrings.languageCode = "en";
      const result = localizedStrings.cancel();
      expect(result).toBe("Cancel");
    });
  });

  describe("annotation notices", () => {
    it("returns zh-TW text when adding phrases is blocked by annotation mode", () => {
      localizedStrings.languageCode = "zh-TW";
      expect(localizedStrings.canNotAddNewPhraseWhenBopomoroAnnotationIs()).toBe(
        "注音字型破音字標記模式開啟時，不能增加新詞"
      );
    });

    it("returns English text when adding phrases is blocked by annotation mode", () => {
      localizedStrings.languageCode = "en";
      expect(localizedStrings.canNotAddNewPhraseWhenBopomoroAnnotationIs()).toBe(
        "Cannot add new phrases when Bopomofo annotation is on."
      );
    });

    it("returns zh-TW text for annotation mode enabled", () => {
      localizedStrings.languageCode = "zh-TW";
      expect(localizedStrings.bopomofoAnnotationOn()).toBe(
        "注音字型標記模式已開啟"
      );
    });

    it("returns English text for annotation mode enabled", () => {
      localizedStrings.languageCode = "en";
      expect(localizedStrings.bopomofoAnnotationOn()).toBe(
        "Bopomofo annotation support on"
      );
    });

    it("returns zh-TW text for variant and PUA annotation mode", () => {
      localizedStrings.languageCode = "zh-TW";
      expect(localizedStrings.bopomofoAnnotationWithVariantsAndPUA()).toBe(
        "注音字型標記：文字中包含變體選擇器與 PUA 字元"
      );
    });

    it("returns English text for variant and PUA annotation mode", () => {
      localizedStrings.languageCode = "en";
      expect(localizedStrings.bopomofoAnnotationWithVariantsAndPUA()).toBe(
        "Bopomofo annotation: variant selectors and PUA blocks in text"
      );
    });

    it("returns zh-TW text for variant-only annotation mode", () => {
      localizedStrings.languageCode = "zh-TW";
      expect(localizedStrings.bopomofoAnnotationWithVariants()).toBe(
        "注音字型標記：文字中包含變體選擇器"
      );
    });

    it("returns English text for variant-only annotation mode", () => {
      localizedStrings.languageCode = "en";
      expect(localizedStrings.bopomofoAnnotationWithVariants()).toBe(
        "Bopomofo annotation: variant selectors in text"
      );
    });

    it("returns zh-TW text for PUA-only annotation mode", () => {
      localizedStrings.languageCode = "zh-TW";
      expect(localizedStrings.bopomofoAnnotationWithPUA()).toBe(
        "注音字型標記：文字中包含 PUA 字元"
      );
    });

    it("returns English text for PUA-only annotation mode", () => {
      localizedStrings.languageCode = "en";
      expect(localizedStrings.bopomofoAnnotationWithPUA()).toBe(
        "Bopomofo annotation: PUA blocks in text"
      );
    });
  });

  describe("languageCode property", () => {
    it("defaults languageCode to empty string", () => {
      const newInstance = new LocalizedStrings();
      expect(newInstance.languageCode).toBe("");
    });

    it("allows updating languageCode", () => {
      localizedStrings.languageCode = "zh-TW";
      expect(localizedStrings.languageCode).toBe("zh-TW");
    });
  });

  describe("edge cases", () => {
    it("falls back to English when languageCode is undefined", () => {
      // @ts-ignore - Testing edge case
      localizedStrings.languageCode = undefined;
      const result = localizedStrings.boost();
      expect(result).toBe("Boost"); // Should default to English
    });

    it("falls back to English when languageCode is null", () => {
      // @ts-ignore - Testing edge case
      localizedStrings.languageCode = null;
      const result = localizedStrings.cancel();
      expect(result).toBe("Cancel"); // Should default to English
    });

    it("treats non-zh-TW Chinese locales as English", () => {
      localizedStrings.languageCode = "zh-CN";
      const result = localizedStrings.boost();
      expect(result).toBe("Boost"); // Should default to English for non zh-TW
    });
  });
});
