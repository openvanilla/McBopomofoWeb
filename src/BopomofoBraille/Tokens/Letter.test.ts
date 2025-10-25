import { Letter } from "./Letter";

describe("Test Letter", () => {
  test("Test fromLetter() with valid letter", () => {
    const result = Letter.fromLetter("a");
    expect(result).toBe(Letter.a);
  });

  test("Test fromLetter() with invalid input", () => {
    const result = Letter.fromLetter("1");
    expect(result).toBe(undefined);
  });

  test("Test fromBraille() with valid braille", () => {
    const result = Letter.fromBraille("⠁");
    expect(result).toBe(Letter.a);
  });

  test("Test fromBraille() with valid braille for z", () => {
    const result = Letter.fromBraille("⠵");
    expect(result).toBe(Letter.z);
  });

  test("Test fromBraille() with invalid input", () => {
    const result = Letter.fromBraille("invalid");
    expect(result).toBe(undefined);
  });

  test("Test fromBrailleCode() with valid code", () => {
    const result = Letter.fromBrailleCode("1");
    expect(result).toBe(Letter.a);
  });

  test("Test fromBrailleCode() with valid code for z", () => {
    const result = Letter.fromBrailleCode("1356");
    expect(result).toBe(Letter.z);
  });

  test("Test fromBrailleCode() with invalid code", () => {
    const result = Letter.fromBrailleCode("999");
    expect(result).toBe(undefined);
  });

  test("Test toLetter()", () => {
    const result = Letter.toLetter(Letter.a);
    expect(result).toBe("a");
  });

  test("Test toBraille()", () => {
    const result = Letter.toBraille(Letter.a);
    expect(result).toBe("⠁");
  });

  test("Test toBraille() for z", () => {
    const result = Letter.toBraille(Letter.z);
    expect(result).toBe("⠵");
  });

  test("Test toBrailleCode()", () => {
    const result = Letter.toBrailleCode(Letter.a);
    expect(result).toBe("1");
  });

  test("Test toBrailleCode() for z", () => {
    const result = Letter.toBrailleCode(Letter.z);
    expect(result).toBe("1356");
  });

  test("Test allLetter array", () => {
    expect(Letter.allLetter.length).toBe(26);
    expect(Letter.allLetter).toContain(Letter.a);
    expect(Letter.allLetter).toContain(Letter.z);
  });

  test("Test allBraille array", () => {
    expect(Letter.allBraille.length).toBe(26);
    expect(Letter.allBraille).toContain("⠁");
    expect(Letter.allBraille).toContain("⠵");
  });
});
