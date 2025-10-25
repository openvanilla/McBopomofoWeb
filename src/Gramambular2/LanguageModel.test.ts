import { Unigram } from "./LanguageModel";

describe("Test Unigram", () => {
  test("Test Unigram constructor with default values", () => {
    const unigram = new Unigram();
    expect(unigram.value).toBe("");
    expect(unigram.score).toBe(0);
  });

  test("Test Unigram constructor with specified values", () => {
    const unigram = new Unigram("test", 10.5);
    expect(unigram.value).toBe("test");
    expect(unigram.score).toBe(10.5);
  });

  test("Test Unigram with Chinese characters", () => {
    const unigram = new Unigram("測試", 5.0);
    expect(unigram.value).toBe("測試");
    expect(unigram.score).toBe(5.0);
  });

  test("Test Unigram with negative score", () => {
    const unigram = new Unigram("word", -3.5);
    expect(unigram.value).toBe("word");
    expect(unigram.score).toBe(-3.5);
  });

  test("Test Unigram readonly properties", () => {
    const unigram = new Unigram("readonly", 1.0);
    expect(unigram.value).toBe("readonly");
    expect(unigram.score).toBe(1.0);
  });
});
