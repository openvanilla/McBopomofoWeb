import { Service } from "./Service";

describe("Service", () => {
  test("forwards user phrases to the language model", () => {
    const service = new Service();
    const setUserPhrases = jest.fn();
    (service as any).lm_ = {
      ...(service as any).lm_,
      setUserPhrases,
    };
    const phrases = new Map([["ㄘㄜˋ-ㄕˋ", ["測試"]]]);

    service.setUserPhrases(phrases);

    expect(setUserPhrases).toHaveBeenCalledWith(phrases);
  });

  test("forwards excluded phrases to the language model", () => {
    const service = new Service();
    const setExcludedPhrases = jest.fn();
    (service as any).lm_ = {
      ...(service as any).lm_,
      setExcludedPhrases,
    };
    const phrases = new Map([["ㄘㄜˋ-ㄕˋ", ["測試"]]]);

    service.setExcludedPhrases(phrases);

    expect(setExcludedPhrases).toHaveBeenCalledWith(phrases);
  });

  test("round-trips full sentence through Braille conversion", () => {
    const service = new Service();
    const input = "由「小麥」的作者";
    const r1 = service.convertTextToBraille(input);
    const r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("converts ordinal phrase with digit to Braille and back", () => {
    const service = new Service();
    const input = "第1名";
    const r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠼⠂ ⠍⠽⠂");
    const r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 1 明");
  });

  test("converts ordinal phrase with uppercase letter to Braille and back", () => {
    const service = new Service();
    const input = "第A名";
    const r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠠⠁ ⠍⠽⠂");
    const r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 A 明");
  });

  test("converts ordinal phrase with spaced uppercase letters to Braille and back", () => {
    const service = new Service();
    const input = "第A B名";
    const r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠠⠁ ⠠⠃ ⠍⠽⠂");
    const r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 A B 明");
  });

  test("converts ordinal phrase with adjacent uppercase letters to Braille and back", () => {
    const service = new Service();
    const input = "第AB名";
    const r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠠⠁⠠⠃ ⠍⠽⠂");
    const r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 AB 明");
  });

  test("converts Braille sentence with tone marks to text", () => {
    const service = new Service();
    const result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠗⠩⠈");
    expect(result).toBe("天氣好");
  });

  test("converts Braille sentence with punctuation to text", () => {
    const service = new Service();
    const result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠗⠩⠈⠂");
    expect(result).toBe("天氣好,");
  });

  test("converts longer Braille sentence to text", () => {
    const service = new Service();
    const result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠁⠥⠄⠙⠮⠁⠗⠥⠈⠗⠩⠈");
    expect(result).toBe("天氣真的很好");
  });

  test("converts sentence to Braille glyphs", () => {
    const service = new Service();
    const result = service.convertTextToBraille("天氣好");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠗⠩⠈");
  });

  test("converts sentence to ASCII Braille glyphs", () => {
    const service = new Service();
    const result = service.convertTextToAsciiBraille("天氣好");
    expect(result).toBe("ft'j*\"r%`");
  });

  test("converts ASCII Braille sentence back to text", () => {
    const service = new Service();
    const result = service.convertAsciiBrailleToText("ft'j*\"r%`");
    expect(result).toBe("天氣好");
  });

  test("preserves line breaks in ASCII Braille round trip", () => {
    const service = new Service();
    const input = "天氣好\n天氣好";
    const braille = service.convertTextToAsciiBraille(input);
    expect(braille).toBe("ft'j*\"r%`\nft'j*\"r%`");
    expect(service.convertAsciiBrailleToText(braille)).toBe(input);
  });

  test("converts longer sentence to Braille glyphs", () => {
    const service = new Service();
    const result = service.convertTextToBraille("天氣真的很好");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠁⠥⠄⠙⠮⠁⠗⠥⠈⠗⠩⠈");
  });

  test("converts weather sentence with duplicate characters to Braille", () => {
    const service = new Service();
    const result = service.convertTextToBraille("今天天氣好清爽");
    expect(result).toBe("⠅⠹⠄⠋⠞⠄⠋⠞⠄⠚⠡⠐⠗⠩⠈⠚⠽⠄⠊⠸⠈");
  });

  test("converts comma punctuation to Braille", () => {
    const service = new Service();
    const result = service.convertTextToBraille("，");
    expect(result).toBe("⠆");
  });

  test("converts phrase with tone mark to Braille", () => {
    const service = new Service();
    const result = service.convertTextToBraille("同樣");
    expect(result).toBe("⠋⠯⠂⠨⠐");
  });

  test("converts repeated punctuation to Braille", () => {
    const service = new Service();
    const result = service.convertTextToBraille("，，，");
    expect(result).toBe("⠆⠆⠆");
  });

  test("converts mixed phrase to Braille", () => {
    const service = new Service();
    const result = service.convertTextToBraille("除了在");
    expect(result).toBe("⠃⠌⠂⠉⠮⠁⠓⠺⠐");
  });

  test("includes digits when converting text to Braille", () => {
    const service = new Service();
    const result = service.convertTextToBraille("天氣好 1234");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠗⠩⠈ ⠼⠂⠆⠒⠲");
  });

  test("converts Braille digits back to text", () => {
    const service = new Service();
    const result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠗⠩⠈ ⠼⠂⠆⠒⠲");
    expect(result).toBe("天氣好 1234");
  });

  test("round-trips input method name through Braille conversion", () => {
    const service = new Service();
    const input = "小麥注音輸入法";
    const r1 = service.convertTextToBraille(input);
    const r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("round-trips decimal number through Braille conversion", () => {
    const service = new Service();
    const input = "2.5";
    const r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠼⠆⠨⠢");
    const r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("round-trips phrase with number through Braille conversion", () => {
    const service = new Service();
    const input = "小麥注音輸入法 2.5";
    const r1 = service.convertTextToBraille(input);
    const r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("converts text to HTML ruby markup", () => {
    const service = new Service();
    const input = "小麥注音輸入法";
    const result = service.convertTextToHtmlRuby(input);
    const expected =
      "<ruby>小<rp>(</rp><rt>ㄒㄧㄠˇ</rt><rp>)</rp></ruby><ruby>麥<rp>(</rp><rt>ㄇㄞˋ</rt><rp>)</rp></ruby><ruby>注<rp>(</rp><rt>ㄓㄨˋ</rt><rp>)</rp></ruby><ruby>音<rp>(</rp><rt>ㄧㄣ</rt><rp>)</rp></ruby><ruby>輸<rp>(</rp><rt>ㄕㄨ</rt><rp>)</rp></ruby><ruby>入<rp>(</rp><rt>ㄖㄨˋ</rt><rp>)</rp></ruby><ruby>法<rp>(</rp><rt>ㄈㄚˇ</rt><rp>)</rp></ruby>";
    expect(result).toBe(expected);
  });

  test("passes through non-reading text when converting to HTML ruby", () => {
    const service = new Service();

    expect(service.convertTextToHtmlRuby("OpenVanilla 123")).toBe(
      "OpenVanilla 123"
    );
  });

  test("converts text to Pinyin readings", () => {
    const service = new Service();
    const input = "小麥注音輸入法";
    const r1 = service.convertTextToPinyin(input);
    expect(r1).toEqual("xiao mai zhu yin shu ru fa");
  });

  test("passes through non-reading text when converting to Pinyin", () => {
    const service = new Service();

    expect(service.convertTextToPinyin("OpenVanilla 123")).toBe(
      "OpenVanilla 123"
    );
  });

  test("converts text to Bopomofo readings", () => {
    const service = new Service();
    let input = "小麥注音輸入法";
    let result = service.convertTextToBpmfReadings(input);
    expect(result).toBe("ㄒㄧㄠˇㄇㄞˋㄓㄨˋㄧㄣㄕㄨㄖㄨˋㄈㄚˇ");

    input = "天氣好";
    result = service.convertTextToBpmfReadings(input);
    expect(result).toBe("ㄊㄧㄢㄑㄧˋㄏㄠˇ");

    input = "今天天氣好清爽";
    result = service.convertTextToBpmfReadings(input);
    expect(result).toBe("ㄐㄧㄣㄊㄧㄢㄊㄧㄢㄑㄧˋㄏㄠˇㄑㄧㄥㄕㄨㄤˇ");

    input = "第1名";
    result = service.convertTextToBpmfReadings(input);
    expect(result).toBe("ㄉㄧˋ1ㄇㄧㄥˊ");

    input = "第AB名";
    result = service.convertTextToBpmfReadings(input);
    expect(result).toBe("ㄉㄧˋABㄇㄧㄥˊ");
  });

  test("appends Bopomofo readings to text", () => {
    const service = new Service();
    let input = "小麥注音輸入法";
    let result = service.appendBpmfReadingsToText(input);
    expect(result).toBe(
      "小(ㄒㄧㄠˇ)麥(ㄇㄞˋ)注(ㄓㄨˋ)音(ㄧㄣ)輸(ㄕㄨ)入(ㄖㄨˋ)法(ㄈㄚˇ)"
    );

    input = "天氣好";
    result = service.appendBpmfReadingsToText(input);
    expect(result).toBe("天(ㄊㄧㄢ)氣(ㄑㄧˋ)好(ㄏㄠˇ)");

    input = "第1名";
    result = service.appendBpmfReadingsToText(input);
    expect(result).toBe("第(ㄉㄧˋ)1名(ㄇㄧㄥˊ)");

    input = "第AB名";
    result = service.appendBpmfReadingsToText(input);
    expect(result).toBe("第(ㄉㄧˋ)AB名(ㄇㄧㄥˊ)");
  });

  test("test convertTextToRawReadings", () => {
    const service = new Service();
    const input = "小麥注音輸入法";
    const result = service.convertTextToRawReadings(input);
    expect(result).toBe("ㄒㄧㄠˇ-ㄇㄞˋ-ㄓㄨˋ-ㄧㄣ-ㄕㄨ-ㄖㄨˋ-ㄈㄚˇ");
  });

  test("passes through non-reading text when converting to raw readings", () => {
    const service = new Service();

    expect(service.convertTextToRawReadings("OpenVanilla 123")).toBe(
      "OpenVanilla 123"
    );
  });

  test("test convertTextToBpmfAnnotatedText", () => {
    const service = new Service();
    const input = "一二三";
    const result = service.convertTextToBpmfAnnotatedText(input);
    // 一 (ㄧ), 二 (ㄦˋ), 三 (ㄙㄢ)
    // From WebBpmfvsVariants.ts:
    // "一-ㄧ": "一"
    // "二-ㄦˋ": "二"
    // "三-ㄙㄢ": "三"
    // So there should be no variation selectors here as they are default readings.
    expect(result).toBe("一二三");

    const result2 = service.convertTextToBpmfAnnotatedText("還錢");
    expect(result2).toBe("還󠇡錢");
  });

  test("passes through non-reading text when converting to annotated text", () => {
    const service = new Service();

    expect(service.convertTextToBpmfAnnotatedText("OpenVanilla 123")).toBe(
      "OpenVanilla 123"
    );
  });

  test("uses a combined reading when the language model returns fewer readings than characters", () => {
    const service = new Service();
    (service as any).lm_ = {
      ...(service as any).lm_,
      getReading: jest.fn((input: string) => {
        if (input === "測試") {
          return "ㄘㄜˋ ㄕˋ";
        }
        return undefined;
      }),
    };

    expect(service.convertTextToBpmfReadings("測試")).toBe("ㄘㄜˋ ㄕˋ");
  });

  test("test convertTextToBpmfReadingsWithSpaces", () => {
    const service = new Service();
    expect(service.convertTextToBpmfReadingsWithSpaces("測試")).toBe("ㄘㄜˋ ㄕˋ");
  });

  test("test annotateSingleCharacter", () => {
    const service = new Service();
    const result = service.annotateSingleCharacter("一", "ㄧ");
    expect(result).toBe("一");

    const result2 = service.annotateSingleCharacter("還", "ㄏㄨㄢˊ");
    expect(result2).toBe("還󠇡");
  });

  test("test generateMermaidGraph with Bopomofo input", () => {
    const service = new Service();
    const result = service.generateMermaidGraph("ㄕㄜˋ ㄐㄧˋ ㄔㄥˊ ㄕˋ ㄇㄚˇ");
    expect(result).toContain("graph LR");
    expect(result).toContain("V0");
    expect(result).toContain("V5");
    expect(result).toContain("classDef selected");
    expect(result).toContain("linkStyle");
  });

  test("test generateMermaidGraph with layout keys input", () => {
    const service = new Service();
    const result = service.generateMermaidGraph("gk4 ru4 t/6 g4 a83");
    expect(result).toContain("graph LR");
    expect(result).toContain("V0");
    expect(result).toContain("V5");
    expect(result).toContain("classDef selected");
    expect(result).toContain("linkStyle");
  });

  test("getWalkResult returns non-empty text for valid Bopomofo input", () => {
    const service = new Service();
    const result = service.getWalkResult("ㄕㄜˋ ㄐㄧˋ ㄔㄥˊ ㄕˋ ㄇㄚˇ");
    expect(result.text.length).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(0); // log-probability is always negative
  });

  test("getWalkResult text matches expected selection for unambiguous input", () => {
    const service = new Service();
    const result = service.getWalkResult("ㄒㄧㄠˇ ㄇㄞˋ ㄓㄨˋ ㄧㄣ");
    expect(result.text).toBe("小麥注音");
    expect(result.score).toBeLessThan(0);
  });

  test("getWalkResult returns empty text for empty input", () => {
    const service = new Service();
    const result = service.getWalkResult("");
    expect(result.text).toBe("");
    expect(result.score).toBe(0);
  });
});
