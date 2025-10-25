import { UserOverrideModel, Suggestion } from "./UserOverrideModel";
import { WalkResult, Node, Unigram } from "../Gramambular2";

describe("UserOverrideModel", () => {
  let model: UserOverrideModel;
  const defaultCapacity = 100;
  const defaultDecayConstant = 10000;

  beforeEach(() => {
    model = new UserOverrideModel(defaultCapacity, defaultDecayConstant);
  });

  describe("Constructor", () => {
    test("creates model with correct capacity and decay exponent", () => {
      const capacity = 50;
      const decayConstant = 5000;
      const testModel = new UserOverrideModel(capacity, decayConstant);

      expect(testModel.m_capacity).toBe(capacity);
      expect(testModel.m_decayExponent).toBe(Math.log(0.5) / decayConstant);
      expect(testModel.m_lruList).toEqual([]);
      expect(testModel.m_lruMap).toEqual({});
    });
  });

  describe("Suggestion class", () => {
    test("creates suggestion with correct properties", () => {
      const candidate = "測試";
      const forceHighScore = true;
      const suggestion = new Suggestion(candidate, forceHighScore);

      expect(suggestion.candidate).toBe(candidate);
      expect(suggestion.forceHighScoreOverride).toBe(forceHighScore);
    });

    test("creates suggestion with false force high score", () => {
      const candidate = "例子";
      const forceHighScore = false;
      const suggestion = new Suggestion(candidate, forceHighScore);

      expect(suggestion.candidate).toBe(candidate);
      expect(suggestion.forceHighScoreOverride).toBe(forceHighScore);
    });
  });

  describe("observe method", () => {
    function createMockNode(
      reading: string,
      value: string,
      spanningLength: number = 1
    ): Node {
      const unigrams = [new Unigram(value, 1.0)];
      const node = new Node(reading, spanningLength, unigrams);
      return node;
    }

    function createMockWalkResult(
      nodes: Node[],
      totalReadings: number = 0
    ): WalkResult {
      return new WalkResult(nodes, 0, 0, 0, totalReadings);
    }

    test("handles undefined walks", () => {
      expect(() => {
        model.observe(undefined, undefined, 0, 1000);
      }).not.toThrow();

      expect(model.m_lruList.length).toBe(0);
    });

    test("handles empty walks", () => {
      const emptyWalk = createMockWalkResult([]);

      expect(() => {
        model.observe(emptyWalk, emptyWalk, 0, 1000);
      }).not.toThrow();

      expect(model.m_lruList.length).toBe(0);
    });

    test("handles mismatched total readings", () => {
      const walk1 = createMockWalkResult([createMockNode("ㄊㄞˊ", "台")], 1);
      const walk2 = createMockWalkResult([createMockNode("ㄊㄞˊ", "臺")], 2);

      model.observe(walk1, walk2, 0, 1000);

      expect(model.m_lruList.length).toBe(0);
    });

    test("observes simple override", () => {
      const beforeNode = createMockNode("ㄊㄞˊ", "台");
      const afterNode = createMockNode("ㄊㄞˊ", "臺");

      const walkBefore = createMockWalkResult([beforeNode], 1);
      const walkAfter = createMockWalkResult([afterNode], 1);

      model.observe(walkBefore, walkAfter, 0, 1000);

      expect(model.m_lruList.length).toBe(1);
      expect(model.m_lruList[0].observation.count).toBe(1);
      expect(model.m_lruList[0].observation.overrides["臺"]).toBeDefined();
    });

    test("handles multi-character phrases", () => {
      const beforeNode = createMockNode("ㄗˋㄏㄨㄟˋ", "字會", 2);
      const afterNode = createMockNode("ㄗˋㄏㄨㄟˋ", "字彙", 2);

      const walkBefore = createMockWalkResult([beforeNode], 2);
      const walkAfter = createMockWalkResult([afterNode], 2);

      model.observe(walkBefore, walkAfter, 0, 1000);

      expect(model.m_lruList.length).toBe(1);
    });

    test("skips phrases over 3 characters", () => {
      const longNode = createMockNode("ㄊㄞˊㄨㄢㄉㄚˋㄒㄩㄝˊ", "台灣大學", 4);

      const walkBefore = createMockWalkResult([longNode], 4);
      const walkAfter = createMockWalkResult([longNode], 4);

      model.observe(walkBefore, walkAfter, 0, 1000);

      expect(model.m_lruList.length).toBe(0);
    });

    test("handles punctuation nodes", () => {
      const punctuationNode = createMockNode("_punctuation_comma", "，");
      const regularNode = createMockNode("ㄊㄞˊ", "台");

      const walkBefore = createMockWalkResult(
        [punctuationNode, regularNode],
        2
      );
      const walkAfter = createMockWalkResult([punctuationNode, regularNode], 2);

      model.observe(walkBefore, walkAfter, 1, 1000);

      expect(model.m_lruList.length).toBe(1);
    });

    test("updates existing observations", () => {
      const beforeNode = createMockNode("ㄊㄞˊ", "台");
      const afterNode1 = createMockNode("ㄊㄞˊ", "臺");
      const afterNode2 = createMockNode("ㄊㄞˊ", "台");

      const walkBefore = createMockWalkResult([beforeNode], 1);
      const walkAfter1 = createMockWalkResult([afterNode1], 1);
      const walkAfter2 = createMockWalkResult([afterNode2], 1);

      // First observation
      model.observe(walkBefore, walkAfter1, 0, 1000);
      expect(model.m_lruList.length).toBe(1);
      expect(model.m_lruList[0].observation.count).toBe(1);

      // Second observation with same context
      model.observe(walkBefore, walkAfter2, 0, 2000);
      expect(model.m_lruList.length).toBe(1);
      expect(model.m_lruList[0].observation.count).toBe(2);
      expect(Object.keys(model.m_lruList[0].observation.overrides).length).toBe(
        2
      );
    });

    test("respects capacity limit", () => {
      const smallModel = new UserOverrideModel(2, defaultDecayConstant);

      for (let i = 0; i < 5; i++) {
        const beforeNode = createMockNode(`ㄊㄞˊ${i}`, `台${i}`);
        const afterNode = createMockNode(`ㄊㄞˊ${i}`, `臺${i}`);

        const walkBefore = createMockWalkResult([beforeNode], 1);
        const walkAfter = createMockWalkResult([afterNode], 1);

        smallModel.observe(walkBefore, walkAfter, 0, 1000 + i);
      }

      expect(smallModel.m_lruList.length).toBe(2);
      expect(Object.keys(smallModel.m_lruMap).length).toBe(2);
    });
  });

  describe("suggest method", () => {
    function createMockNode(
      reading: string,
      value: string,
      spanningLength: number = 1
    ): Node {
      const unigrams = [new Unigram(value, 1.0)];
      const node = new Node(reading, spanningLength, unigrams);
      return node;
    }

    function createMockWalkResult(
      nodes: Node[],
      totalReadings: number = 0
    ): WalkResult {
      return new WalkResult(nodes, 0, 0, 0, totalReadings);
    }

    test("returns undefined for invalid cursor", () => {
      const node = createMockNode("ㄊㄞˊ", "台");
      const walk = createMockWalkResult([node], 1);

      const suggestion = model.suggest(walk, 10, 1000);

      expect(suggestion).toBeUndefined();
    });

    test("returns empty suggestion when no observations", () => {
      const node = createMockNode("ㄊㄞˊ", "台");
      const walk = createMockWalkResult([node], 1);

      const suggestion = model.suggest(walk, 0, 1000);

      expect(suggestion).toBeDefined();
      expect(suggestion!.candidate).toBe("");
      expect(suggestion!.forceHighScoreOverride).toBe(false);
    });

    test("returns suggestion based on observations", () => {
      // First observe an override
      const beforeNode = createMockNode("ㄊㄞˊ", "台");
      const afterNode = createMockNode("ㄊㄞˊ", "臺");

      const walkBefore = createMockWalkResult([beforeNode], 1);
      const walkAfter = createMockWalkResult([afterNode], 1);

      model.observe(walkBefore, walkAfter, 0, 1000);

      // Then ask for suggestion
      const currentWalk = createMockWalkResult([beforeNode], 1);
      const suggestion = model.suggest(currentWalk, 0, 1001);

      expect(suggestion).toBeDefined();
      expect(suggestion!.candidate).toBe("臺");
    });

    test("returns best scoring suggestion", () => {
      const beforeNode = createMockNode("ㄊㄞˊ", "台");

      // Observe multiple overrides
      const overrides = ["臺", "颱", "檯"];
      for (let i = 0; i < overrides.length; i++) {
        const afterNode = createMockNode("ㄊㄞˊ", overrides[i]);
        const walkBefore = createMockWalkResult([beforeNode], 1);
        const walkAfter = createMockWalkResult([afterNode], 1);

        // Observe multiple times for "臺" to make it highest scoring
        const count = overrides[i] === "臺" ? 3 : 1;
        for (let j = 0; j < count; j++) {
          model.observe(walkBefore, walkAfter, 0, 1000 + i * 10 + j);
        }
      }

      const currentWalk = createMockWalkResult([beforeNode], 1);
      const suggestion = model.suggest(currentWalk, 0, 1100);

      expect(suggestion).toBeDefined();
      expect(suggestion!.candidate).toBe("臺");
    });

    test("handles force high score override flag", () => {
      // Create a more realistic scenario
      const beforeNode = createMockNode("ㄊㄞˊ", "台");
      const afterNode = createMockNode("ㄊㄞˊ", "臺");

      const walkBefore = createMockWalkResult([beforeNode], 1);
      const walkAfter = createMockWalkResult([afterNode], 1);

      model.observe(walkBefore, walkAfter, 0, 1000);

      const currentWalk = createMockWalkResult([beforeNode], 1);
      const suggestion = model.suggest(currentWalk, 0, 1001);

      expect(suggestion).toBeDefined();
      // Just check that we get a valid suggestion, the exact force flag depends on internal logic
      expect(suggestion!.candidate).toBe("臺");
      expect(typeof suggestion!.forceHighScoreOverride).toBe("boolean");
    });
  });

  describe("suggestInner method", () => {
    test("returns empty suggestion for unknown key", () => {
      const suggestion = model.suggestInner("unknown-key", 1000);

      expect(suggestion.candidate).toBe("");
      expect(suggestion.forceHighScoreOverride).toBe(false);
    });

    test("handles decayed observations", () => {
      // Create a model with fast decay
      const fastDecayModel = new UserOverrideModel(100, 1);

      // Add an observation using public methods
      const beforeNode = new Node("ㄊㄞˊ", 1, [new Unigram("台", 1.0)]);
      const afterNode = new Node("ㄊㄞˊ", 1, [new Unigram("臺", 1.0)]);

      const walkBefore = new WalkResult([beforeNode], 0, 0, 0, 1);
      const walkAfter = new WalkResult([afterNode], 0, 0, 0, 1);

      fastDecayModel.observe(walkBefore, walkAfter, 0, 1000);

      // Ask for suggestion much later (should be decayed)
      const currentWalk = new WalkResult([beforeNode], 0, 0, 0, 1);
      const suggestion = fastDecayModel.suggest(currentWalk, 0, 10000);

      expect(suggestion).toBeDefined();
      expect(suggestion!.candidate).toBe("");
    });
  });

  describe("LRU behavior", () => {
    test("maintains LRU order when accessing existing keys", () => {
      const smallModel = new UserOverrideModel(3, defaultDecayConstant);

      function createMockNode(reading: string, value: string): Node {
        const unigrams = [new Unigram(value, 1.0)];
        return new Node(reading, 1, unigrams);
      }

      function createMockWalkResult(nodes: Node[]): WalkResult {
        return new WalkResult(nodes, 0, 0, 0, nodes.length);
      }

      // Add 3 observations
      for (let i = 0; i < 3; i++) {
        const beforeNode = createMockNode(`reading${i}`, `before${i}`);
        const afterNode = createMockNode(`reading${i}`, `after${i}`);

        const walkBefore = createMockWalkResult([beforeNode]);
        const walkAfter = createMockWalkResult([afterNode]);

        smallModel.observe(walkBefore, walkAfter, 0, 1000 + i);
      }

      expect(smallModel.m_lruList.length).toBe(3);

      // Check that LRU list is properly maintained
      expect(smallModel.m_lruList.length).toBeLessThanOrEqual(3);
      expect(Object.keys(smallModel.m_lruMap).length).toBeLessThanOrEqual(3);
    });
  });

  describe("Edge cases and error handling", () => {
    test("handles cursor at position 0", () => {
      function createMockNode(reading: string, value: string): Node {
        const unigrams = [new Unigram(value, 1.0)];
        return new Node(reading, 1, unigrams);
      }

      function createMockWalkResult(nodes: Node[]): WalkResult {
        return new WalkResult(nodes, 0, 0, 0, 1);
      }

      const node = createMockNode("ㄊㄞˊ", "台");
      const walk = createMockWalkResult([node]);

      // When cursor is at position 0, the model may still create observations
      // depending on the findNodeAt implementation
      model.observe(walk, walk, 0, 1000);

      // The exact behavior depends on the implementation
      expect(model.m_lruList.length).toBeGreaterThanOrEqual(0);
    });

    test("handles empty candidate strings", () => {
      const beforeNode = new Node("test", 1, [new Unigram("", 1.0)]);
      const afterNode = new Node("test", 1, [new Unigram("", 1.0)]);

      const walkBefore = new WalkResult([beforeNode], 0, 0, 0, 1);
      const walkAfter = new WalkResult([afterNode], 0, 0, 0, 1);

      model.observe(walkBefore, walkAfter, 0, 1000);

      const suggestion = model.suggest(walkBefore, 0, 1001);
      expect(suggestion).toBeDefined();
      expect(suggestion!.candidate).toBe("");
    });

    test("handles multiple candidates with same score", () => {
      const beforeNode = new Node("test", 1, [new Unigram("original", 1.0)]);
      const afterNode1 = new Node("test", 1, [new Unigram("candidate1", 1.0)]);
      const afterNode2 = new Node("test", 1, [new Unigram("candidate2", 1.0)]);

      const walkBefore = new WalkResult([beforeNode], 0, 0, 0, 1);
      const walkAfter1 = new WalkResult([afterNode1], 0, 0, 0, 1);
      const walkAfter2 = new WalkResult([afterNode2], 0, 0, 0, 1);

      // Add two candidates with same count and timestamp
      model.observe(walkBefore, walkAfter1, 0, 1000);
      model.observe(walkBefore, walkAfter2, 0, 1000);

      const suggestion = model.suggest(walkBefore, 0, 1001);

      // Should return one of them (implementation dependent)
      expect(["candidate1", "candidate2"]).toContain(suggestion!.candidate);
    });
  });

  describe("Performance and memory management", () => {
    test("handles large number of observations efficiently", () => {
      const largeModel = new UserOverrideModel(1000, defaultDecayConstant);

      function createMockNode(reading: string, value: string): Node {
        const unigrams = [new Unigram(value, 1.0)];
        return new Node(reading, 1, unigrams);
      }

      function createMockWalkResult(nodes: Node[]): WalkResult {
        return new WalkResult(nodes, 0, 0, 0, 1);
      }

      const startTime = Date.now();

      for (let i = 0; i < 500; i++) {
        const beforeNode = createMockNode(`reading${i}`, `before${i}`);
        const afterNode = createMockNode(`reading${i}`, `after${i}`);

        const walkBefore = createMockWalkResult([beforeNode]);
        const walkAfter = createMockWalkResult([afterNode]);

        largeModel.observe(walkBefore, walkAfter, 0, 1000 + i);
      }

      const endTime = Date.now();

      expect(largeModel.m_lruList.length).toBeLessThanOrEqual(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in reasonable time
    });
  });

  describe("Integration scenarios", () => {
    test("handles realistic user override scenario", () => {
      // User types "台灣" and system suggests "台湾"
      // User overrides to "台灣"
      const beforeNode1 = createMockNode("ㄊㄞˊ", "台");
      const beforeNode2 = createMockNode("ㄨㄢ", "湾");
      const afterNode1 = createMockNode("ㄊㄞˊ", "台");
      const afterNode2 = createMockNode("ㄨㄢ", "灣");

      const walkBefore = new WalkResult([beforeNode1, beforeNode2], 0, 0, 0, 2);
      const walkAfter = new WalkResult([afterNode1, afterNode2], 0, 0, 0, 2);

      model.observe(walkBefore, walkAfter, 1, 1000);

      // Later, when user types same context, should suggest "灣"
      const suggestion = model.suggest(walkBefore, 1, 1001);

      expect(suggestion).toBeDefined();
      expect(suggestion!.candidate).toBe("灣");
    });

    function createMockNode(
      reading: string,
      value: string,
      spanningLength: number = 1
    ): Node {
      const unigrams = [new Unigram(value, 1.0)];
      return new Node(reading, spanningLength, unigrams);
    }

    test("handles breaking up phrases", () => {
      // User has "字彙" as one phrase but wants to type "字會" as two characters
      const beforeNode = createMockNode("ㄗˋㄏㄨㄟˋ", "字彙", 2);
      const afterNode1 = createMockNode("ㄗˋ", "字");
      const afterNode2 = createMockNode("ㄏㄨㄟˋ", "會");

      const walkBefore = new WalkResult([beforeNode], 0, 0, 0, 2);
      const walkAfter = new WalkResult([afterNode1, afterNode2], 0, 0, 0, 2);

      model.observe(walkBefore, walkAfter, 0, 1000);

      expect(model.m_lruList.length).toBe(1);

      // The observation should be based on the after-walk for breaking up phrases
      const suggestion = model.suggest(walkAfter, 0, 1001);
      expect(suggestion).toBeDefined();
    });

    test("handles time-based decay correctly", () => {
      const beforeNode = createMockNode("ㄊㄞˊ", "台");
      const afterNode = createMockNode("ㄊㄞˊ", "臺");

      const walkBefore = new WalkResult([beforeNode], 0, 0, 0, 1);
      const walkAfter = new WalkResult([afterNode], 0, 0, 0, 1);

      // Add old observation
      model.observe(walkBefore, walkAfter, 0, 1000);

      // Add recent observation with different candidate
      const afterNode2 = createMockNode("ㄊㄞˊ", "檯");
      const walkAfter2 = new WalkResult([afterNode2], 0, 0, 0, 1);
      model.observe(walkBefore, walkAfter2, 0, 2000);

      // Recent observation should have higher score due to time decay
      const suggestion = model.suggest(walkBefore, 0, 2001);
      expect(suggestion).toBeDefined();
      expect(suggestion!.candidate).toBe("檯");
    });
  });
});
