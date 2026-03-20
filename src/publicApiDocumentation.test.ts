import * as fs from "fs";
import * as path from "path";

const readSource = (relativePath: string): string => {
  return fs.readFileSync(path.resolve(__dirname, relativePath), "utf8");
};

const expectDocumented = (source: string, signature: string): void => {
  const escaped = signature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`/\\*\\*[\\s\\S]*?\\*/\\s*${escaped}`, "m");
  expect(source).toMatch(pattern);
};

describe("public API documentation", () => {
  test("documents root and submodule entry points", () => {
    expectDocumented(readSource("index.ts"), "export { InputController }");
    expectDocumented(readSource("index.ts"), "export { Service }");
    expectDocumented(
      readSource("BopomofoBraille/index.ts"),
      "export { BopomofoBrailleConverter }",
    );
    expectDocumented(
      readSource("ChineseNumbers/index.ts"),
      "export { Case, ChineseNumbers }",
    );
    expectDocumented(
      readSource("RomanNumbers/index.ts"),
      "export {",
    );
  });

  test("documents public conversion enums and types", () => {
    const brailleTypeSource = readSource("BopomofoBraille/Tokens/BrailleType.ts");
    const syllableSource = readSource("Mandarin/BopomofoSyllable.ts");

    expectDocumented(brailleTypeSource, "export enum BrailleType");
    expectDocumented(syllableSource, "export type Component = number;");
  });

  test("documents public InputController methods used by integrators", () => {
    const source = readSource("McBopomofo/InputController.ts");

    expectDocumented(source, "get readableLayoutKeys(): Map<string, string> {");
    expectDocumented(
      source,
      "public setExcludedPhrases(input: Map<string, string[]> | string): void {",
    );
    expectDocumented(
      source,
      "public setOnExcludedPhraseChange(",
    );
    expectDocumented(source, "public getOnError(): Function | undefined {");
    expectDocumented(
      source,
      "public getOnOpenUrl(): ((input: string) => void) | undefined {",
    );
    expectDocumented(
      source,
      "public getCtrlEnterOption(): CtrlEnterOption {",
    );
    expectDocumented(
      source,
      "public selectCandidateAtIndex(candidateID: number): void {",
    );
    expectDocumented(
      source,
      "public setBopomofoFontAnnotationSupportEnabled(flag: boolean) {",
    );
    expectDocumented(
      source,
      "public simpleKeyboardEvent(",
    );
  });
});
