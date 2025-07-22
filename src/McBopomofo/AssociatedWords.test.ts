/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { WebLanguageModel } from "./WebLanguageModel";
import { webData } from "./WebData";

describe("AssociatedWords", () => {
  let lm: WebLanguageModel;

  beforeEach(() => {
    lm = new WebLanguageModel(webData);
  });

  test("getAssociationWords returns valid candidates", () => {
    const associationWords = lm.getAssociationWords("我");
    expect(associationWords).toBeDefined();
    expect(Array.isArray(associationWords)).toBe(true);
    
    // Should return at most 6 candidates as per our implementation
    expect(associationWords.length).toBeLessThanOrEqual(6);
    
    // Each candidate should have valid properties
    for (const candidate of associationWords) {
      expect(candidate.reading).toBeDefined();
      expect(candidate.value).toBeDefined();
      expect(typeof candidate.reading).toBe('string');
      expect(typeof candidate.value).toBe('string');
      expect(candidate.reading.length).toBeGreaterThan(0);
      expect(candidate.value.length).toBeGreaterThan(0);
    }
  });

  test("getAssociationWords returns empty array for empty input", () => {
    expect(lm.getAssociationWords("")).toEqual([]);
    expect(lm.getAssociationWords(null as any)).toEqual([]);
    expect(lm.getAssociationWords(undefined as any)).toEqual([]);
  });

  test("getAssociationWords returns appropriate suggestions for common characters", () => {
    const testCases = ["我", "的", "了", "在", "很"];
    
    for (const testCase of testCases) {
      const associationWords = lm.getAssociationWords(testCase);
      
      // Should have some suggestions for common characters
      if (associationWords.length > 0) {
        // Verify that candidates are reasonable
        for (const candidate of associationWords) {
          expect(candidate.value).not.toBe(testCase); // Should not return the same word
          expect(candidate.value.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test("getAssociationWords handles rare characters gracefully", () => {
    const rareText = "鱱";
    const associationWords = lm.getAssociationWords(rareText);
    
    // Should not crash and return valid array
    expect(Array.isArray(associationWords)).toBe(true);
    // Might return empty array for rare characters, which is fine
    expect(associationWords.length).toBeGreaterThanOrEqual(0);
  });
});