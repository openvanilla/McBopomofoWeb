import { BopomofoBrailleConverter, BopomofoSyllable } from "./index";
import { BopomofoBrailleConverter as DirectConverter } from "./Converter";
import { BopomofoSyllable as DirectSyllable } from "./Tokens/BopomofoSyllable";

describe("BopomofoBraille index exports", () => {
  test("re-exports BopomofoBrailleConverter", () => {
    expect(BopomofoBrailleConverter).toBe(DirectConverter);
  });

  test("re-exports token BopomofoSyllable", () => {
    expect(BopomofoSyllable).toBe(DirectSyllable);
  });
});
