import { BopomofoBrailleSyllable } from "./BopomofoBraille";

describe("Test BopomofoSyllable", () => {
  test("Test 1", () => {
    let result = BopomofoBrailleSyllable.fromBpmf("ㄋㄧˇ");
    expect(result.braille).toBe("⠝⠡⠈");
  });

  test("Test 1", () => {
    let result = BopomofoBrailleSyllable.fromBraille("⠝⠡⠈");
    expect(result.bpmf).toBe("ㄋㄧˇ");
  });

  test("Test 2", () => {
    let result = BopomofoBrailleSyllable.fromBpmf("ㄨㄢ");
    expect(result.braille).toBe("⠻⠄");
  });
});
