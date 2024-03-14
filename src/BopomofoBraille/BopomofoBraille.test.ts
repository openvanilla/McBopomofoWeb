import { BopomofoSyllable } from "./BopomofoBraille";

describe("Test BopomofoSyllable", () => {
  test("Test 1", () => {
    let result = BopomofoSyllable.fromBpmf("ㄋㄧˇ");
    expect(result.braille).toBe("⠝⠡⠈");
  });

  test("Test 1", () => {
    let result = BopomofoSyllable.fromBraille("⠝⠡⠈");
    expect(result.bpmf).toBe("ㄋㄧˇ");
  });

  test("Test 2", () => {
    let result = BopomofoSyllable.fromBpmf("ㄨㄢ");
    expect(result.braille).toBe("⠻⠄");
  });
});
