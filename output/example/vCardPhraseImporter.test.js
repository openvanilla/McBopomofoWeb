const {
  extractChineseNamesFromVCard,
} = require("./vCardPhraseImporter");

describe("vCardPhraseImporter", () => {
  test("extracts chinese names from FN", () => {
    const text = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:王小明",
      "END:VCARD",
    ].join("\n");

    expect(extractChineseNamesFromVCard(text)).toEqual(["王小明"]);
  });

  test("prefers N and combines last name with first name without spaces", () => {
    const text = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:大文 陳",
      "N:陳;大文;;;",
      "END:VCARD",
    ].join("\n");

    expect(extractChineseNamesFromVCard(text)).toEqual(["陳大文"]);
  });

  test("falls back to N when FN is missing", () => {
    const text = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:陳;大文;;;",
      "END:VCARD",
    ].join("\n");

    expect(extractChineseNamesFromVCard(text)).toEqual(["陳大文"]);
  });

  test("removes spaces when falling back to FN", () => {
    const text = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:王 小明",
      "END:VCARD",
    ].join("\n");

    expect(extractChineseNamesFromVCard(text)).toEqual(["王小明"]);
  });

  test("ignores non-chinese names and deduplicates names", () => {
    const text = [
      "BEGIN:VCARD",
      "FN:John Smith",
      "END:VCARD",
      "BEGIN:VCARD",
      "FN:王小明",
      "END:VCARD",
      "BEGIN:VCARD",
      "FN:王小明",
      "END:VCARD",
    ].join("\n");

    expect(extractChineseNamesFromVCard(text)).toEqual(["王小明"]);
  });

  test("supports folded lines", () => {
    const text = [
      "BEGIN:VCARD",
      "FN:王小",
      " 明",
      "END:VCARD",
    ].join("\n");

    expect(extractChineseNamesFromVCard(text)).toEqual(["王小明"]);
  });
});
