import { BopomofoSyllable } from "./index";

describe("Test Pintin", () => {
  test("Test 1", () => {
    let s = "yang5";
    let result = BopomofoSyllable.FromHanyuPinyin(s);
    console.log(result);
    console.log(result.hasToneMarker);
  });
});
