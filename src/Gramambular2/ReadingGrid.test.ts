// ...existing code...
import { ReadingGrid } from "./ReadingGrid";
import { LanguageModel, Unigram } from "./LanguageModel";

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
    let result = grid.deleteReadingBeforeCursor();
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
    let result = grid.deleteReadingAfterCursor();
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

    let result = grid.walk();
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
});
// ...existing code...
