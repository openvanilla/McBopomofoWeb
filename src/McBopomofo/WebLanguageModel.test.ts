import { webData } from "./WebData";
import { WebLanguageModel } from "./WebLanguageModel";

describe("Test get reading", () => {
  test("Test 1", () => {
    let model = new WebLanguageModel(webData);
    let reading = model.getReading("楊");
    expect(reading).toBe("ㄧㄤˊ");
  });
});
