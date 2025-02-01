import { Service } from "./Service";

describe("Test service", () => {
  test("Test convertBrailleToText 1", () => {
    let service = new Service();
    let input = "由「小麥」的作者";
    let r1 = service.convertTextToBraille(input);
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("Test convertBrailleToText 2 - 1", () => {
    let service = new Service();
    let input = "第1名";
    let r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠼⠂ ⠍⠽⠂");
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 1 明");
  });

  test("Test convertBrailleToText 2 - 2", () => {
    let service = new Service();
    let input = "第A名";
    let r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠠⠁ ⠍⠽⠂");
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 A 明");
  });

  test("Test convertBrailleToText 2 - 3", () => {
    let service = new Service();
    let input = "第A B名";
    let r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠠⠁ ⠠⠃ ⠍⠽⠂");
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 A B 明");
  });

  test("Test convertBrailleToText 2 - 4", () => {
    let service = new Service();
    let input = "第AB名";
    let r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠙⠡⠐ ⠠⠁⠠⠃ ⠍⠽⠂");
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe("地 AB 明");
  });

  test("Test convertBrailleToText 3", () => {
    let service = new Service();
    let result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠗⠩⠈");
    expect(result).toBe("天氣好");
  });

  test("Test convertBrailleToText with punctuation", () => {
    let service = new Service();
    let result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠗⠩⠈⠂");
    expect(result).toBe("天氣好,");
  });

  test("Test convertBrailleToText 4", () => {
    let service = new Service();
    let result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠁⠥⠄⠙⠮⠁⠗⠥⠈⠗⠩⠈");
    expect(result).toBe("天氣真的很好");
  });

  test("Test convertTextToBraille 5", () => {
    let service = new Service();
    let result = service.convertTextToBraille("天氣好");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠗⠩⠈");
  });
  test("Test convertTextToBraille 6", () => {
    let service = new Service();
    let result = service.convertTextToBraille("天氣真的很好");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠁⠥⠄⠙⠮⠁⠗⠥⠈⠗⠩⠈");
  });

  test("Test convertTextToBraille 7", () => {
    let service = new Service();
    let result = service.convertTextToBraille("今天天氣好清爽");
    expect(result).toBe("⠅⠹⠄⠋⠞⠄⠋⠞⠄⠚⠡⠐⠗⠩⠈⠚⠽⠄⠊⠸⠈");
  });

  test("Test convertTextToBraille 8", () => {
    let service = new Service();
    let result = service.convertTextToBraille("，");
    expect(result).toBe("⠆");
  });

  test("Test convertTextToBraille 9", () => {
    let service = new Service();
    let result = service.convertTextToBraille("同樣");
    expect(result).toBe("⠋⠯⠂⠨⠐");
  });

  test("Test convertTextToBraille 10", () => {
    let service = new Service();
    let result = service.convertTextToBraille("，，，");
    expect(result).toBe("⠆⠆⠆");
  });

  test("Test convertTextToBraille 11", () => {
    let service = new Service();
    let result = service.convertTextToBraille("除了在");
    expect(result).toBe("⠃⠌⠂⠉⠮⠁⠓⠺⠐");
  });

  test("Test convertTextToBraille with digits 1", () => {
    let service = new Service();
    let result = service.convertTextToBraille("天氣好 1234");
    expect(result).toBe("⠋⠞⠄⠚⠡⠐⠗⠩⠈ ⠼⠂⠆⠒⠲");
  });

  test("Test convertTextToBraille with digits1", () => {
    let service = new Service();
    let result = service.convertBrailleToText("⠋⠞⠄⠚⠡⠐⠗⠩⠈ ⠼⠂⠆⠒⠲");
    expect(result).toBe("天氣好 1234");
  });

  test("Test two way convert 1", () => {
    let service = new Service();
    let input = "小麥注音輸入法";
    let r1 = service.convertTextToBraille(input);
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("Test two way convert 2", () => {
    let service = new Service();
    let input = "2.5";
    let r1 = service.convertTextToBraille(input);
    expect(r1).toBe("⠼⠆⠨⠢");
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("Test two way convert 3", () => {
    let service = new Service();
    let input = "小麥注音輸入法 2.5";
    let r1 = service.convertTextToBraille(input);
    let r2 = service.convertBrailleToText(r1);
    expect(r2).toBe(input);
  });

  test("Test convertTextToHtmlRuby", () => {
    let service = new Service();
    let input = "小麥注音輸入法";
    let result = service.convertTextToHtmlRuby(input);
    let expected =
      "<ruby>小<rp>(</rp><rt>ㄒㄧㄠˇ</rt><rp>)</rp></ruby><ruby>麥<rp>(</rp><rt>ㄇㄞˋ</rt><rp>)</rp></ruby><ruby>注<rp>(</rp><rt>ㄓㄨˋ</rt><rp>)</rp></ruby><ruby>音<rp>(</rp><rt>ㄧㄣ</rt><rp>)</rp></ruby><ruby>輸<rp>(</rp><rt>ㄕㄨ</rt><rp>)</rp></ruby><ruby>入<rp>(</rp><rt>ㄖㄨˋ</rt><rp>)</rp></ruby><ruby>法<rp>(</rp><rt>ㄈㄚˇ</rt><rp>)</rp></ruby>";
    expect(result).toBe(expected);
  });

  test("Test Pinyin", () => {
    let service = new Service();
    let input = "小麥注音輸入法";
    let r1 = service.convertTextToPinyin(input);
    expect(r1).toEqual("xiao mai zhu yin shu ru fa");
  });

  test("Test convertTextToBpmfReadings", () => {
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

  test("Test appendBpmfReadingsToText", () => {
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
