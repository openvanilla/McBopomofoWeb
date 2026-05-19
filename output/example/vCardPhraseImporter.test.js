const {
  extractImportPhrasesFromVCard,
} = require("./vCardPhraseImporter.js");

describe("extractImportPhrasesFromVCard", () => {
  it("extracts phrases from vCard exports", () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:楊維中",
      "N:楊;維中;;;",
      "END:VCARD",
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:Alice Example",
      "N:Example;Alice;;;",
      "END:VCARD",
    ].join("\n");

    expect(extractImportPhrasesFromVCard(vcard)).toEqual(["楊維中"]);
    expect(
      extractImportPhrasesFromVCard(vcard, {
        includeFirstNamePhrases: true,
      }),
    ).toEqual(["楊維中", "維中"]);
  });

  it("extracts phrases from Google Contacts CSV exports", () => {
    const csv = [
      "\uFEFFName,Given Name,Additional Name,Family Name",
      '"王小明","小明","","王"',
      '"Alice Example","Alice","","Example"',
      '"陳美玲","美玲","","陳"',
    ].join("\n");

    expect(extractImportPhrasesFromVCard(csv)).toEqual(["王小明", "陳美玲"]);
    expect(
      extractImportPhrasesFromVCard(csv, {
        includeFirstNamePhrases: true,
      }),
    ).toEqual(["王小明", "小明", "陳美玲", "美玲"]);
  });

  it("extracts phrases from Outlook Contacts CSV exports", () => {
    const csv = [
      "First Name,Middle Name,Last Name,Name",
      '"維中","","楊","楊 維中"',
      '"John","","Example","Example, John"',
      '"小華","","林","林 小華"',
    ].join("\n");

    expect(extractImportPhrasesFromVCard(csv)).toEqual(["楊維中", "林小華"]);
    expect(
      extractImportPhrasesFromVCard(csv, {
        includeFirstNamePhrases: true,
      }),
    ).toEqual(["楊維中", "維中", "林小華", "小華"]);
  });
});
