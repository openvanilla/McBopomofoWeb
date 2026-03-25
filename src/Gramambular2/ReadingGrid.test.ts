import { LanguageModel, Unigram } from "./LanguageModel";
import {
  Node,
  OverrideType,
  ReadingGrid,
  ScoreRankedLanguageModel,
  Span,
} from "./ReadingGrid";

class MockLanguageModel implements LanguageModel {
  getUnigrams(key: string): Unigram[] {
    if (key === "testReading") {
      return [new Unigram("testValue", -1)];
    }
    if (key === "testReading2") {
      return [new Unigram("testValue2", -1)];
    }
    return [];
  }
  hasUnigrams(key: string): boolean {
    return key === "testReading" || key === "testReading2";
  }
}

describe("ReadingGrid", () => {
  it("should handle reading separator", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);

    expect(grid.readingSeparator).toBe("-"); // Default separator

    grid.readingSeparator = "+";
    expect(grid.readingSeparator).toBe("+");

    grid.insertReading("testReading");
    grid.insertReading("testReading2");

    // Test that separator affects walk results
    const result = grid.walk();
    expect(result.readingsAsStrings()).toEqual(["testReading", "testReading2"]);

    // Test invalid separator
    grid.readingSeparator = "";
    expect(grid.readingSeparator).toBe("");
  });
  it("should insert a reading and walk the grid", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);
    const inserted = grid.insertReading("testReading");
    expect(inserted).toBe(true);
    expect(grid.readings).toContain("testReading");
    const result = grid.walk();
    expect(result.readingsAsStrings()).toStrictEqual(["testReading"]);
    expect(result.valuesAsStrings()).toContain("testValue");
  });

  it("should update cursor when inserting readings", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);

    expect(grid.cursor).toBe(0);
    let result = grid.insertReading("testReading");
    expect(result).toBe(true);
    expect(grid.cursor).toBe(1);

    result = grid.insertReading("testReading");
    expect(result).toBe(true);
    expect(grid.cursor).toBe(2);

    result = grid.insertReading("");
    expect(result).toBe(false);
    expect(grid.cursor).toBe(2);

    result = grid.insertReading("invalidReading");
    expect(result).toBe(false);
    expect(grid.cursor).toBe(2);
  });

  it("should remove the reading before the cursor", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);
    grid.insertReading("testReading");
    grid.insertReading("testReading2");
    expect(grid.readings).toEqual(["testReading", "testReading2"]);
    expect(grid.cursor).toBe(2);

    grid.deleteReadingBeforeCursor();
    expect(grid.readings).toEqual(["testReading"]);
    expect(grid.cursor).toBe(1);

    grid.cursor = 0;
    const result = grid.deleteReadingBeforeCursor();
    expect(result).toBe(false);
  });

  it("should remove the reading after the cursor", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);
    grid.insertReading("testReading");
    grid.insertReading("testReading2");
    expect(grid.readings).toEqual(["testReading", "testReading2"]);
    expect(grid.cursor).toBe(2);

    grid.cursor = 0;
    grid.deleteReadingAfterCursor();
    expect(grid.readings).toEqual(["testReading2"]);
    expect(grid.cursor).toBe(0);

    grid.cursor = 1;
    const result = grid.deleteReadingAfterCursor();
    expect(result).toBe(false);
  });

  it("should return candidates for the given location", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);

    const candidatesNull = grid.candidatesAt(0);
    expect(candidatesNull).toEqual([]);

    grid.insertReading("testReading");
    grid.insertReading("testReading2");

    const candidates0 = grid.candidatesAt(0);
    expect(candidates0.map((c) => c.value)).toContain("testValue");

    const candidates1 = grid.candidatesAt(1);
    expect(candidates1.map((c) => c.value)).toContain("testValue2");

    const candidates3 = grid.candidatesAt(3);
    expect(candidates3).toEqual([]);
  });

  it("should override candidate with string", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);
    grid.insertReading("testReading");
    expect(grid.overrideCandidateWithString(0, "testValue2")).toBe(false);

    grid.insertReading("testReading2");
    expect(grid.overrideCandidateWithString(1, "testValue2")).toBe(true);

    const result = grid.walk();
    expect(result.valuesAsStrings()).toContain("testValue2");

    expect(result.nodes[0].value).toBe("testValue");
    expect(result.nodes[1].value).toBe("testValue2");
    expect(result.nodes[1].isOverridden).toBe(true);
  });

  it("should find nodes at given cursor positions", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);

    // Empty grid
    let result = grid.walk();
    let [node, cursor, index] = result.findNodeAt(0);
    expect(node).toBeUndefined();
    expect(cursor).toBe(0);
    expect(index).toBeUndefined();

    // Single reading
    grid.insertReading("testReading");
    result = grid.walk();
    [node, cursor, index] = result.findNodeAt(0);
    expect(node?.value).toBe("testValue");
    expect(cursor).toBe(1);
    expect(index).toBe(0);

    // Multiple readings
    grid.insertReading("testReading2");
    result = grid.walk();

    // First node
    [node, cursor, index] = result.findNodeAt(0);
    expect(node?.value).toBe("testValue");
    expect(cursor).toBe(1);
    expect(index).toBe(0);

    // Second node
    [node, cursor, index] = result.findNodeAt(1);
    expect(node?.value).toBe("testValue2");
    expect(cursor).toBe(2);
    expect(index).toBe(1);
  });

  it("should handle invalid cursor for overrideCandidateWithString", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);

    expect(grid.overrideCandidateWithString(-1, "testValue")).toBe(false);
    expect(grid.overrideCandidateWithString(0, "testValue")).toBe(false);

    grid.insertReading("testReading");
    expect(grid.overrideCandidateWithString(2, "testValue")).toBe(false);
  });

  it("should clear the grid correctly", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);

    // Add some readings
    grid.insertReading("testReading");
    grid.insertReading("testReading2");
    expect(grid.readings).toEqual(["testReading", "testReading2"]);
    expect(grid.length).toBe(2);
    expect(grid.cursor).toBe(2);

    // Clear the grid
    grid.clear();

    // Verify grid is cleared
    expect(grid.readings).toEqual([]);
    expect(grid.length).toBe(0);
    expect(grid.cursor).toBe(0);

    // Make sure we can add readings after clearing
    grid.insertReading("testReading");
    expect(grid.readings).toEqual(["testReading"]);
    expect(grid.length).toBe(1);
    expect(grid.cursor).toBe(1);
  });

  it("should bypass range combining for single-reading updates", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);
    const combineReadingRangeSpy = jest.spyOn(grid as any, "combineReadingRange");

    grid.insertReading("testReading");

    expect(combineReadingRangeSpy).not.toHaveBeenCalled();

    grid.insertReading("testReading2");

    expect(combineReadingRangeSpy).toHaveBeenCalled();
  });

  it("should insert reading in the middle of existing readings", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);
    grid.insertReading("testReading");
    grid.insertReading("testReading2");
    // cursor is now at position 2; move it to position 1 (middle)
    grid.cursor = 1;
    grid.insertReading("testReading");
    // expandGridAt(1): loc=1, !loc=false, loc===spans_.length? 1!==2 → else branch (lines 377-378)
    expect(grid.readings.length).toBe(3);
    expect(grid.readings[0]).toBe("testReading");
    expect(grid.readings[1]).toBe("testReading");
    expect(grid.readings[2]).toBe("testReading2");
  });

  it("Node.value returns empty string when unigrams is empty", () => {
    const node = new Node("reading", 1, []);
    expect(node.value).toBe("");
  });

  it("Node.score returns 0 when unigrams is empty", () => {
    const node = new Node("reading", 1, []);
    expect(node.score).toBe(0);
  });

  it("should use top unigram score when kOverrideValueWithScoreFromTopUnigram override is applied", () => {
    const mockLM = new MockLanguageModel();
    const grid = new ReadingGrid(mockLM);
    grid.insertReading("testReading");
    grid.insertReading("testReading2");
    // Override at cursor position 2 using kOverrideValueWithScoreFromTopUnigram
    const result = grid.overrideCandidateWithString(
      2,
      "testValue2",
      OverrideType.kOverrideValueWithScoreFromTopUnigram
    );
    expect(result).toBe(true);
    // Walk the grid – the overridden node should use the top-unigram score (line 594)
    const walk = grid.walk();
    expect(walk.nodes.length).toBeGreaterThan(0);
  });

  it("should clear a span's nodes", () => {
    const span = new Span();
    const node = new Node("reading", 1, [new Unigram("value", -1)]);
    span.add(node);
    expect(span.maxLength).toBe(1);
    expect(span.nodeOf(1)).toBeDefined();
    // Span.clear() covers lines 774-775
    span.clear();
    expect(span.maxLength).toBe(0);
    expect(span.nodeOf(1)).toBeUndefined();
  });

  it("should handle removeNodesOfOrLongerThan reaching index 0", () => {
    const span = new Span();
    // Add only a node of spanningLength 2 (no node at length 1)
    const node2 = new Node("reading2", 2, [new Unigram("value2", -1)]);
    span.add(node2);
    expect(span.maxLength).toBe(2);
    // Remove nodes of length >= 2; while loop starts at i=0, finds nothing, hits i===0 (lines 811-815)
    span.removeNodesOfOrLongerThan(2);
    expect(span.maxLength).toBe(0);
    expect(span.nodeOf(1)).toBeUndefined();
    expect(span.nodeOf(2)).toBeUndefined();
  });

  it("ScoreRankedLanguageModel.getUnigrams and hasUnigrams throw NotImplemented", () => {
    const innerLm: LanguageModel = {
      getUnigrams: () => [],
      hasUnigrams: () => false,
    };
    // Lines 836, 839, 842
    const slm = new ScoreRankedLanguageModel(innerLm);
    expect(() => slm.getUnigrams("key")).toThrow();
    expect(() => slm.hasUnigrams("key")).toThrow();
  });
});
