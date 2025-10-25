import { Service } from "./Service";

describe("Service", () => {
  test("round-trips full sentence through Braille conversion", () => {
    let service = new Service();
    let input = "由「小麥」的作者";
    let r1 = service.convertTextToBraille(input);
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("converts ordinal phrase with digit to Braille and back", () => {
    let service = new Service();
    let input = "第1名";
    let r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠼⠂ ⠍⠽⠂");
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 1 明");
  });

  test("converts ordinal phrase with uppercase letter to Braille and back", () => {
    let service = new Service();
    let input = "第A名";
    let r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠠⠁ ⠍⠽⠂");
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 A 明");
  });

  test("converts ordinal phrase with spaced uppercase letters to Braille and back", () => {
    let service = new Service();
    let input = "第A B名";
    let r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠠⠁ ⠠⠃ ⠍⠽⠂");
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 A B 明");
  });

  test("converts ordinal phrase with adjacent uppercase letters to Braille and back", () => {
    let service = new Service();
    let input = "第AB名";
    let r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠠⠁⠠⠃ ⠍⠽⠂");
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 AB 明");
  });

  test("converts Braille sentence with tone marks to text", () => {
    let service = new Service();
    let result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠗⠩⠈");
    expect(result).toBe("天氣好");
  });

  test("converts Braille sentence with punctuation to text", () => {
    let service = new Service();
    let result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠗⠩⠈⠂");
    expect(result).toBe("天氣好,");
  });

  test("converts longer Braille sentence to text", () => {
    let service = new Service();
    let result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠁⠥⠄⠙⠮⠁⠗⠥⠈⠗⠩⠈");
    expect(result).toBe("天氣真的很好");
  });

  test("converts sentence to Braille glyphs", () => {
    let service = new Service();
    let result = service.convertTextToBraille("天氣好");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠗⠩⠈");
  });
  test("converts longer sentence to Braille glyphs", () => {
    let service = new Service();
    let result = service.convertTextToBraille("天氣真的很好");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠁⠥⠄⠙⠮⠁⠗⠥⠈⠗⠩⠈");
  });

  test("converts weather sentence with duplicate characters to Braille", () => {
    let service = new Service();
    let result = service.convertTextToBraille("今天天氣好清爽");
    expect(result).toBe("⠅⠹⠄⠋⠞⠄⠋⠞⠄⠚⠡⠐⠗⠩⠈⠚⠽⠄⠊⠸⠈");
  });

  test("converts comma punctuation to Braille", () => {
    let service = new Service();
    let result = service.convertTextToBraille("，");
    expect(result).toBe("⠆");
  });

  test("converts phrase with tone mark to Braille", () => {
    let service = new Service();
    let result = service.convertTextToBraille("同樣");
    expect(result).toBe("⠋⠯⠂⠨⠐");
  });

  test("converts repeated punctuation to Braille", () => {
    let service = new Service();
    let result = service.convertTextToBraille("，，，");
    expect(result).toBe("⠆⠆⠆");
  });

  test("converts mixed phrase to Braille", () => {
    let service = new Service();
    let result = service.convertTextToBraille("除了在");
    expect(result).toBe("⠃⠌⠂⠉⠮⠁⠓⠺⠐");
  });

  test("includes digits when converting text to Braille", () => {
    let service = new Service();
    let result = service.convertTextToBraille("天氣好 1234");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠗⠩⠈ ⠼⠂⠆⠒⠲");
  });

  test("converts Braille digits back to text", () => {
    let service = new Service();
    let result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠗⠩⠈ ⠼⠂⠆⠒⠲");
    expect(result).toBe("天氣好 1234");
  });

  test("round-trips input method name through Braille conversion", () => {
    let service = new Service();
    let input = "小麥注音輸入法";
    let r1 = service.convertTextToBraille(input);
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("round-trips decimal number through Braille conversion", () => {
    let service = new Service();
    let input = "2.5";
    let r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠼⠆⠨⠢");
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("round-trips phrase with number through Braille conversion", () => {
    let service = new Service();
    let input = "小麥注音輸入法 2.5";
    let r1 = service.convertTextToBraille(input);
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("converts text to HTML ruby markup", () => {
    let service = new Service();
    let input = "小麥注音輸入法";
    let result = service.convertTextToHtmlRuby(input);
    let expected =
      "<ruby>小<rp>(</rp><rt>ㄒㄧㄠˇ</rt><rp>)</rp></ruby><ruby>麥<rp>(</rp><rt>ㄇㄞˋ</rt><rp>)</rp></ruby><ruby>注<rp>(</rp><rt>ㄓㄨˋ</rt><rp>)</rp></ruby><ruby>音<rp>(</rp><rt>ㄧㄣ</rt><rp>)</rp></ruby><ruby>輸<rp>(</rp><rt>ㄕㄨ</rt><rp>)</rp></ruby><ruby>入<rp>(</rp><rt>ㄖㄨˋ</rt><rp>)</rp></ruby><ruby>法<rp>(</rp><rt>ㄈㄚˇ</rt><rp>)</rp></ruby>";
    expect(result).toBe(expected);
  });

  test("converts text to Pinyin readings", () => {
    let service = new Service();
    let input = "小麥注音輸入法";
    let r1 = service.convertTextToPinyin(input);
    expect(r1).toEqual("xiao mai zhu yin shu ru fa");
  });

  test("converts text to Bopomofo readings", () => {
    let service = new Service();
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
    let service = new Service();
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
});
