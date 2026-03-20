import { BopomofoBrailleConverter as DirectConverter } from "./Converter";
import { BopomofoBrailleConverter, BopomofoSyllable } from "./index";
import { BopomofoSyllable as DirectSyllable } from "./Tokens/BopomofoSyllable";

describe("BopomofoBraille index exports", () => {
  test("re-exports BopomofoBrailleConverter", () => {
    expect(BopomofoBrailleConverter).toBe(DirectConverter);
  });

  test("re-exports token BopomofoSyllable", () => {
    expect(BopomofoSyllable).toBe(DirectSyllable);
  });
});
