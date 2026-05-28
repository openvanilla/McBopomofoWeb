import { Service } from "./McBopomofo/Service";
import {
  annotateSingleCharacterForMcp,
  convertBpmfToBrailleWithFormat,
  convertBpmfToTextForMcp,
  convertBrailleToBpmfWithFormat,
  convertBrailleToTextWithFormat,
  convertTextToBpmfAnnotatedTextForMcp,
  convertTextToBpmfReadingsForMcp,
  convertTextToBpmfReadingsWithSpacesForMcp,
  convertTextToBrailleWithFormat,
  convertTextToPinyinForMcp,
} from "./mcp";

describe("mcp braille format helpers", () => {
  test("converts text to unicode braille by default", () => {
    const service = new Service();

    expect(convertTextToBrailleWithFormat(service, "天氣好")).toBe("⠋⠞⠄⠚⠡⠐⠗⠩⠈");
  });

  test("converts text to ascii braille when requested", () => {
    const service = new Service();

    expect(convertTextToBrailleWithFormat(service, "天氣好", "ascii")).toBe(
      "ft'j*\"r%`"
    );
  });

  test("converts braille to text using requested format", () => {
    const service = new Service();

    expect(convertBrailleToTextWithFormat(service, "⠋⠞⠄⠚⠡⠐⠗⠩⠈")).toBe("天氣好");
    expect(convertBrailleToTextWithFormat(service, "ft'j*\"r%`", "ascii")).toBe(
      "天氣好"
    );
  });

  test("converts bpmf to braille using requested format", () => {
    expect(convertBpmfToBrailleWithFormat("ㄊㄧㄢㄑㄧˋㄏㄠˇ")).toBe(
      "⠋⠞⠄⠚⠡⠐⠗⠩⠈"
    );
    expect(convertBpmfToBrailleWithFormat("ㄊㄧㄢㄑㄧˋㄏㄠˇ", "ascii")).toBe(
      "ft'j*\"r%`"
    );
  });

  test("converts braille to bpmf using requested format", () => {
    expect(convertBrailleToBpmfWithFormat("⠋⠞⠄⠚⠡⠐⠗⠩⠈")).toBe(
      "ㄊㄧㄢㄑㄧˋㄏㄠˇ"
    );
    expect(convertBrailleToBpmfWithFormat("ft'j*\"r%`", "ascii")).toBe(
      "ㄊㄧㄢㄑㄧˋㄏㄠˇ"
    );
  });
});

describe("mcp service helpers", () => {
  test("converts text to bopomofo readings", () => {
    const service = new Service();

    expect(convertTextToBpmfReadingsForMcp(service, "天氣好")).toBe(
      "ㄊㄧㄢㄑㄧˋㄏㄠˇ"
    );
  });

  test("converts text to bopomofo readings with spaces", () => {
    const service = new Service();

    expect(convertTextToBpmfReadingsWithSpacesForMcp(service, "天氣好")).toBe(
      "ㄊㄧㄢ ㄑㄧˋ ㄏㄠˇ"
    );
  });

  test("converts bopomofo readings to text", () => {
    const service = new Service();

    expect(convertBpmfToTextForMcp(service, "ㄊㄧㄢㄑㄧˋㄏㄠˇ")).toBe(
      "天氣好"
    );
  });

  test("converts text to pinyin", () => {
    const service = new Service();

    expect(convertTextToPinyinForMcp(service, "小麥注音輸入法")).toBe(
      "xiao mai zhu yin shu ru fa"
    );
  });

  test("converts text to bopomofo-annotated text", () => {
    const service = new Service();

    expect(convertTextToBpmfAnnotatedTextForMcp(service, "還錢")).toBe("還󠇡錢");
  });

  test("annotates a single character with a reading", () => {
    const service = new Service();

    expect(annotateSingleCharacterForMcp(service, "還", "ㄏㄨㄢˊ")).toBe("還󠇡");
  });
});
