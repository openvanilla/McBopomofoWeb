const { extractImportPhrasesFromVCard } = require("./vCardPhraseImporter");

describe("vCardPhraseImporter", () => {
  test("extracts chinese names from FN", () => {
    const text = ["BEGIN:VCARD", "VERSION:3.0", "FN:王小明", "END:VCARD"].join(
      "\n",
    );

    expect(extractImportPhrasesFromVCard(text)).toEqual(["王小明"]);
  });

  test("prefers N and combines last name with first name without spaces", () => {
    const text = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:大文 陳",
      "N:陳;大文;;;",
      "END:VCARD",
    ].join("\n");

    expect(extractImportPhrasesFromVCard(text)).toEqual(["陳大文"]);
  });

  test("can also generate first-name-only phrases", () => {
    const text = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:楊;維中;;;",
      "END:VCARD",
    ].join("\n");

    expect(
      extractImportPhrasesFromVCard(text, {
        includeFirstNamePhrases: true,
      }),
    ).toEqual(["楊維中", "維中"]);
  });

  test("ignores one-character full names and one-character first names", () => {
    const text = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:王",
      "END:VCARD",
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:王;小;;;",
      "END:VCARD",
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:王;小明;;;",
      "END:VCARD",
    ].join("\n");

    expect(
      extractImportPhrasesFromVCard(text, {
        includeFirstNamePhrases: true,
      }),
    ).toEqual(["王小", "王小明", "小明"]);
  });

  test("ignores whitespace-only values, non-chinese names, and deduplicates", () => {
    const text = [
      "BEGIN:VCARD",
      "FN:John Smith",
      "END:VCARD",
      "BEGIN:VCARD",
      "FN:  王 小明  ",
      "END:VCARD",
      "BEGIN:VCARD",
      "N:王;小明;;;",
      "END:VCARD",
    ].join("\n");

    expect(extractImportPhrasesFromVCard(text)).toEqual(["王小明"]);
  });

  test("supports folded lines", () => {
    const text = ["BEGIN:VCARD", "FN:王小", " 明", "END:VCARD"].join("\n");

    expect(extractImportPhrasesFromVCard(text)).toEqual(["王小明"]);
  });
});
