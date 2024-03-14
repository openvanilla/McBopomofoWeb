import { BopomofoBraille } from "./BopomofoBraille";

describe("Test BopomofoSyllable", () => {
  test("Test 1", () => {
    let result = BopomofoBraille.BopomofoSyllable.fromBpmf("ㄋㄧˇ");
    expect(result.braille).toBe("⠝⠡⠈");
  });
});
