
import { NumberInputHelper } from "./InputHelperNumber";
import { LanguageModel, Unigram } from "../Gramambular2";

class MockLanguageModel implements LanguageModel {
  private unigrams: Map<string, Unigram[]> = new Map();

  constructor() {}

  addUnigram(key: string, value: string) {
    if (!this.unigrams.has(key)) {
      this.unigrams.set(key, []);
    }
    this.unigrams.get(key)?.push(new Unigram(value, 0));
  }

  getUnigrams(key: string): Unigram[] {
    return this.unigrams.get(key) || [];
  }

  hasUnigrams(key: string): boolean {
    return this.unigrams.has(key);
  }
}

describe("NumberInputHelper", () => {
  let lm: MockLanguageModel;

  beforeEach(() => {
    lm = new MockLanguageModel();
  });

  describe("fillCandidateStrings", () => {
    it("should return an empty array for empty input", () => {
      const result = NumberInputHelper.fillCandidateStrings("", lm);
      expect(result).toEqual([]);
    });

    it("should handle integer input", () => {
      const result = NumberInputHelper.fillCandidateStrings("123", lm);
      expect(result).toContain("一百二十三"); // Chinese lowercase
      expect(result).toContain("壹佰貳拾參"); // Chinese uppercase
      expect(result).toContain("CXXIII"); // Roman
      expect(result).toContain("〡二〣\n百[單位]"); // Suzhou
    });

    it("should handle decimal input", () => {
      const result = NumberInputHelper.fillCandidateStrings("123.45", lm);
      expect(result).toContain("一百二十三點四五"); // Chinese lowercase
      expect(result).toContain("壹佰貳拾參點肆伍"); // Chinese uppercase
      expect(result).toContain("〡二〣〤〥\n百[單位]"); // Suzhou
    });

    it("should handle leading zeros", () => {
      const result = NumberInputHelper.fillCandidateStrings("0123", lm);
      expect(result).toContain("一百二十三");
    });

    it("should handle trailing zeros", () => {
      const result = NumberInputHelper.fillCandidateStrings("1230", lm);
      expect(result).toContain("一千二百三十");
    });

    it("should not convert to Roman numerals if > 3999", () => {
      const result = NumberInputHelper.fillCandidateStrings("4000", lm);
      expect(result).not.toContain("MMMM");
    });

    it("should use language model", () => {
      lm.addUnigram("_number_123", "test");
      const result = NumberInputHelper.fillCandidateStrings("123", lm);
      expect(result).toContain("test");
    });
  });

  describe("fillCandidates", () => {
    it("should return an array of Candidate objects", () => {
      const result = NumberInputHelper.fillCandidates("123", lm);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].reading).toBe("123");
      expect(result[0].value).toBe("一百二十三");
    });
  });
});
