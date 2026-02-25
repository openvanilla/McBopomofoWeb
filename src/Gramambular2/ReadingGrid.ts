/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { LanguageModel, Unigram } from "./LanguageModel";

/**
 * A grid for deriving the most likely hidden values from a series of
 * observations. For our purpose, the observations are Bopomofo readings, and
 * the hidden values are the actual Mandarin words. This can also be used for
 * segmentation: in that case, the observations are Mandarin words, and the
 * hidden values are the most likely groupings.
 *
 * While we use the terminology from hidden Markov model (HMM), the actual
 * implementation is a much simpler Bayesian inference, since the underlying
 * language model consists of only unigrams. Once we have put all plausible
 * unigrams as nodes on the grid, a simple DAG shortest-path walk will give us
 * the maximum likelihood estimation (MLE) for the hidden values.
 * @class
 */
export class ReadingGrid {
  private cursor_: number = 0;
  private separator_: string = ReadingGrid.kDefaultSeparator;
  private spans_: Span[] = [];
  private readings_: string[] = [];

  constructor(private lm_: LanguageModel) {}

  /**
   * Clears the grid.
   */
  clear() {
    this.cursor_ = 0;
    this.readings_ = [];
    this.spans_ = [];
  }

  /**
   * The readings in the grid.
   */
  get readings(): string[] {
    return this.readings_;
  }

  /**
   * The length of the readings in the grid.
   */
  get length(): number {
    return this.readings_.length;
  }

  /**
   * The cursor position in the grid.
   */
  get cursor(): number {
    return this.cursor_;
  }

  set cursor(cursor: number) {
    this.cursor_ = cursor;
  }

  /**
   * The separator for readings.
   */
  get readingSeparator(): string {
    return this.separator_;
  }

  set readingSeparator(readingSeparator: string) {
    this.separator_ = readingSeparator;
  }

  /**
   * Inserts a reading at the current cursor position.
   * @param reading The reading to insert.
   * @returns True if the reading was inserted, false otherwise.
   */
  insertReading(reading: string): boolean {
    if (reading.length === 0 || reading === this.separator_) {
      return false;
    }
    if (!this.lm_.hasUnigrams(reading)) {
      return false;
    }

    this.readings_.splice(this.cursor_, 0, reading);
    this.expandGridAt(this.cursor_);
    this.update();
    ++this.cursor_;
    return true;
  }

  /**
   * Delete the reading before the cursor, like Backspace. Cursor will decrement
   * by one.
   * @returns Always returns false.
   */
  deleteReadingBeforeCursor(): boolean {
    if (!this.cursor_) {
      return false;
    }
    this.readings_.splice(this.cursor_ - 1, 1);
    --this.cursor_;
    this.shrinkGridAt(this.cursor_);
    this.update();
    return false;
  }

  /**
   * Delete the reading after the cursor, like Del. Cursor is unmoved.
   * @returns Always returns false.
   */
  deleteReadingAfterCursor(): boolean {
    if (this.cursor_ >= this.readings_.length) {
      return false;
    }
    this.readings_.splice(this.cursor_, 1);
    this.shrinkGridAt(this.cursor_);
    this.update();
    return false;
  }

  static kMaximumSpanLength: number = 8;
  static kDefaultSeparator: string = "-";

  /**
   * Find the weightiest path in the grid graph. The path represents the most
   * likely hidden chain of events from the observations. We use the Viterbi
   * algorithm compute such path. Instead of computing the path with the
   * shortest distance, though, we compute the path with the longest distance
   * (so the weightiest), since with log probability a larger value means a
   * larger probability. The algorithm runs in O(|V| + |E|) time for G = (V, E)
   * where G is a DAG. This means the walk is fairly economical even when the
   * grid is large.
   * @returns The result of the walk.
   */
  walk(): WalkResult {
    if (this.spans_.length === 0) {
      return new WalkResult([], 0, 0, 0, 0);
    }
    const start = GetEpochNowInMicroseconds();

  // Defines a state in the DP table. This structure tracks the maximum
  // accumulated score and the back-pointer required for path reconstruction in
  // the Viterbi algorithm.
  class State {
     fromIndex:number = 0;
     fromNode: (Node | undefined) = undefined;
     maxScore: number = -Number.MAX_VALUE;
  };

  const readingLen = this.readings_.length;
  const viterbi: State[] = new Array(readingLen + 1);
  viterbi[0].maxScore = 0.0;

  // Iterate through the grid and compute the maximum accumulated score for each
  // reachable position. Since the grid is a lattice where edges only point
  // forward, processing nodes in index order is equivalent to processing them
  // in topological order.
  let reachableStates = 0;
  let evaluatedEdges = 0;
  for (let i = 0; i < readingLen; ++i) {
    ++reachableStates;

    const span = this.spans_[i];
    const maxSpanLen = span.maxLength;

      for (size_t spanLen = 1; spanLen <= maxSpanLen; ++spanLen) {
      const ReadingGrid::NodePtr& node = span.nodeOf(spanLen);
      if (node == nullptr) {
         continue;
      }
      ++evaluatedEdges;

      // Performs a relaxation on a transition. This updates the destination
      // state if the path through the current node yields a higher score than
      // the previously known best path. This is the core operation of the
      // Viterbi algorithm, adapted for finding the maximum likelihood path.
      double score = viterbi[i].maxScore + node->score();
      State& target = viterbi[i + spanLen];
      if (score > target.maxScore) {
        target.maxScore = score;
        target.fromNode = node;
        target.fromIndex = i;
      }
    }
  }
  // Vertices are the reachable states
  // Edges are the candidate word transitions
  result.vertices = reachableStates;
  result.edges = evaluatedEdges;

  // Reconstruct the most likely path by tracing back from the end of the grid
  // to the root using the back-pointers


    // const vspans: VertexSpan[] = [];
    // for (let i = 0; i < this.spans_.length; ++i) {
    //   vspans.push([]);
    // }
    // let vertices = 0;
    // let edges = 0;

    // for (let i = 0, len = this.spans_.length; i < len; ++i) {
    //   const span = this.spans_[i];
    //   for (let j = 1, maxSpanLen = span.maxLength; j <= maxSpanLen; ++j) {
    //     const p = span.nodeOf(j);
    //     if (p !== undefined) {
    //       const v = new Vertex(p);
    //       vspans[i].push(v);
    //       ++vertices;
    //     }
    //   }
    // }

    // const terminal = new Vertex(new Node("_TERMINAL_", -99, []));

    // for (let i = 0, vspansLen = vspans.length; i < vspansLen; ++i) {
    //   for (const v of vspans[i]) {
    //     const nextVertexPos = i + v.node.spanningLength;
    //     if (nextVertexPos === vspansLen) {
    //       v.edges.push(terminal);
    //       continue;
    //     }

    //     for (const nv of vspans[nextVertexPos]) {
    //       v.edges.push(nv);
    //       ++edges;
    //     }
    //   }
    // }

    // const root = new Vertex(new Node("_ROOT_", 0, []));
    // root.distance = 0;
    // for (const v of vspans[0]) {
    //   root.edges.push(v);
    // }

    // const ordered = TopologicalSort(root);
    // const reversed = ordered.reverse();
    // for (const u of reversed) {
    //   for (const v of u.edges) {
    //     Relax(u, v);
    //   }
    // }

    const walkedNodes: Node[] = [];
    let totalReadingLen = 0;
    let currentVertex = terminal;
    while (currentVertex.prev !== undefined) {
      walkedNodes.push(currentVertex.prev.node);
      currentVertex = currentVertex.prev;
      totalReadingLen += currentVertex.node.spanningLength;
    }
    walkedNodes.pop();
    walkedNodes.reverse();

    const result = new WalkResult(
      walkedNodes,
      vertices,
      edges,
      GetEpochNowInMicroseconds() - start,
      totalReadingLen
    );
    return result;
  }

  /**
   * Returns all candidate values at the location. If spans are not empty and
   * loc is at the end of the spans, (loc - 1) is used, so that the caller does
   * not have to care about this boundary condition.
   * @param loc The location to get candidates from.
   * @returns A list of candidates.
   */
  candidatesAt(loc: number): Candidate[] {
    const result: Candidate[] = [];
    if (this.readings_.length === 0) {
      return result;
    }

    if (loc > this.readings_.length) {
      return result;
    }

    const nodes = this.overlappingNodesAt(
      loc === this.readings_.length ? loc - 1 : loc
    );

    // Sort nodes by reading length.
    nodes.sort((n1, n2) => n2.node.spanningLength - n1.node.spanningLength);

    for (const nodeInSpan of nodes) {
      for (const unigram of nodeInSpan.node.unigrams) {
        result.push(
          new Candidate(nodeInSpan.node.reading, unigram.value, unigram.value)
        );
      }
    }
    return result;
  }

  /**
   * Adds weight to the node with the unigram that has the designated candidate
   * value and applies the desired override type, essentially resulting in user
   * override. An overridden node would influence the grid walk to favor walking
   * through it.
   * @param loc The location of the candidate.
   * @param candidate The candidate to override.
   * @param overrideType The type of override.
   * @returns True if the override was successful, false otherwise.
   */
  overrideCandidate = (
    loc: number,
    candidate: Candidate,
    overrideType: OverrideType = OverrideType.kOverrideValueWithHighScore
  ) =>
    this.overrideCandidate_(
      loc,
      candidate.reading,
      candidate.value,
      overrideType
    );

  /**
   * Same as the method above, but since the string candidate value is used, if
   * there are multiple nodes (of different spanning length) that have the same
   * unigram value, it's not guaranteed which node will be selected.
   * @param loc The location of the candidate.
   * @param candidate The candidate to override.
   * @param overrideType The type of override.
   * @returns True if the override was successful, false otherwise.
   */
  overrideCandidateWithString = (
    loc: number,
    candidate: string,
    overrideType: OverrideType = OverrideType.kOverrideValueWithHighScore
  ) => this.overrideCandidate_(loc, undefined, candidate, overrideType);

  private overrideCandidate_(
    loc: number,
    reading: string | undefined,
    value: string,
    overrideType: OverrideType
  ): boolean {
    if (loc > this.readings_.length) {
      return false;
    }

    const overlappingNodes = this.overlappingNodesAt(
      loc === this.readings_.length ? loc - 1 : loc
    );
    let overridden: NodeInSpan | undefined = undefined;

    for (const nis of overlappingNodes) {
      if (reading !== undefined && nis.node.reading !== reading) {
        continue;
      }

      if (nis.node.selectOverrideUnigram(value, overrideType)) {
        overridden = nis;
        break;
      }
    }

    if (overridden?.node === undefined) {
      // Nothing gets overridden.
      return false;
    }

    for (
      let i = overridden.spanIndex;
      i < overridden.spanIndex + overridden.node.spanningLength &&
      i < this.spans_.length;
      ++i
    ) {
      // We also need to reset *all* nodes that share the same location in the
      // span. For example, if previously the two walked nodes are "A BC" where
      // A and BC are two nodes with overrides. The user now chooses "DEF" which
      // is a node that shares the same span location with "A". The node with BC
      // will be reset as it's part of the overlapping node, but A is not.
      const nodes = this.overlappingNodesAt(i);
      for (const nis of nodes) {
        if (nis.node !== overridden.node) {
          nis.node.reset();
        }
      }
    }
    return true;
  }

  private expandGridAt(loc: number) {
    if (!loc || loc === this.spans_.length) {
      this.spans_.splice(loc, 0, new Span());
      return;
    }
    this.spans_.splice(loc, 0, new Span());
    this.removeAffectedNodes(loc);
  }

  private shrinkGridAt(loc: number) {
    if (loc === this.spans_.length) {
      return;
    }
    this.spans_.splice(loc, 1);
    this.removeAffectedNodes(loc);
  }

  private removeAffectedNodes(loc: number) {
    // Because of the expansion, certain spans now have "broken" nodes. We need
    // to remove those. For example, before:
    //
    // Span index 0   1   2   3
    //                (---)
    //                (-------)
    //            (-----------)
    //
    // After we've inserted a span at 2:
    //
    // Span index 0   1   2   3   4
    //                (---)
    //                (----   ----)
    //            (--------   ----)
    //
    // Similarly for shrinkage, before:
    //
    // Span index 0   1   2   3
    //                (---)
    //                (-------)
    //            (-----------)
    //
    // After we've deleted the span at 2:
    //
    // Span index 0   1   2   3   4
    //                (---)
    //                XXXXX
    //            XXXXXXXXX
    //
    if (this.spans_.length === 0) {
      return;
    }
    const affectedLength = ReadingGrid.kMaximumSpanLength - 1;
    const begin = loc <= affectedLength ? 0 : loc - affectedLength;
    const end = loc >= 1 ? loc - 1 : 0;
    for (let i = begin; i <= end; ++i) {
      this.spans_[i].removeNodesOfOrLongerThan(loc - i + 1);
    }
  }

  private insert(loc: number, node: Node) {
    // assert(loc < this.spans_.length);
    this.spans_[loc].add(node);
  }

  private combineReading(reading: string[]): string {
    return reading.join(this.separator_);
  }

  private hasNodeAt(loc: number, readingLen: number, reading: string): boolean {
    if (loc > this.spans_.length) {
      return false;
    }
    const n = this.spans_[loc].nodeOf(readingLen);
    if (n === undefined) {
      return false;
    }
    return reading === n.reading;
  }

  private update() {
    const begin =
      this.cursor_ <= ReadingGrid.kMaximumSpanLength
        ? 0
        : this.cursor_ - ReadingGrid.kMaximumSpanLength;
    let end = this.cursor_ + ReadingGrid.kMaximumSpanLength;
    if (end > this.readings_.length) {
      end = this.readings_.length;
    }
    for (let pos = begin; pos < end; pos++) {
      for (
        let len = 1;
        len <= ReadingGrid.kMaximumSpanLength && pos + len <= end;
        len++
      ) {
        const combinedReading = this.combineReading(
          this.readings_.slice(pos, pos + len)
        );

        if (!this.hasNodeAt(pos, len, combinedReading)) {
          const unigrams = this.lm_.getUnigrams(combinedReading);
          if (unigrams.length === 0) {
            continue;
          }

          this.insert(pos, new Node(combinedReading, len, unigrams));
        }
      }
    }
  }

  /**
   * Find all nodes that overlap with the location. The return value is a list
   * of nodes along with their starting location in the grid.
   * @param loc The location to find overlapping nodes.
   * @returns A list of nodes that overlap with the location.
   */
  overlappingNodesAt(loc: number): NodeInSpan[] {
    const results: NodeInSpan[] = [];

    if (this.spans_.length === 0 || loc >= this.spans_.length) {
      return results;
    }

    // First, get all nodes from the span at location.
    for (let i = 1, len = this.spans_[loc].maxLength; i <= len; ++i) {
      const ptr: Node | undefined = this.spans_[loc].nodeOf(i);
      if (ptr !== undefined) {
        const element = new NodeInSpan(ptr, loc);
        results.push(element);
      }
    }

    const begin = loc - Math.min(loc, ReadingGrid.kMaximumSpanLength - 1);
    for (let i = begin; i < loc; ++i) {
      const beginLen = loc - i + 1;
      const endLen = this.spans_[i].maxLength;
      for (let j = beginLen; j <= endLen; ++j) {
        const ptr = this.spans_[i].nodeOf(j);
        if (ptr !== undefined) {
          const element = new NodeInSpan(ptr, i);
          results.push(element);
        }
      }
    }

    return results;
  }
}

/**
 * The type of override.
 * @enum {number}
 */
export enum OverrideType {
  kNone,
  // Override the node with a unigram value and a score such that the node
  // will almost always be favored by the walk.
  kOverrideValueWithHighScore,
  // Override the node with a unigram value but with the score of the
  // top unigram. For example, if the unigrams in the node are ("a", -1),
  // ("b", -2), ("c", -10), overriding using this type for "c" will cause
  // the node to return the value "c" with the score -1. This is used for
  // soft-override such as from a suggestion. The node with the override
  // value will very likely be favored by a walk, but it does not prevent
  // other nodes from prevailing, which would be the case if
  // kOverrideValueWithHighScore was used.
  kOverrideValueWithScoreFromTopUnigram,
}

/**
 * A node in the reading grid.
 * @class
 */
export class Node {
  private overrideType_: OverrideType = OverrideType.kNone;
  private selectedIndex_ = 0;

  constructor(
    public readonly reading: string,
    public readonly spanningLength: number,
    public readonly unigrams: Unigram[]
  ) {}

  /**
   * The current unigram of the node.
   */
  get currentUnigram(): Unigram {
    return this.unigrams.length === 0
      ? new Unigram("", 0)
      : this.unigrams[this.selectedIndex_];
  }

  /**
   * The value of the current unigram.
   */
  get value(): string {
    return this.unigrams.length === 0
      ? ""
      : this.unigrams[this.selectedIndex_].value;
  }

  /**
   * The score of the current unigram.
   */
  get score(): number {
    if (this.unigrams.length === 0) {
      return 0;
    }

    switch (this.overrideType_) {
      case OverrideType.kOverrideValueWithHighScore:
        return Node.kOverridingScore;
      case OverrideType.kOverrideValueWithScoreFromTopUnigram:
        return this.unigrams[0].score;
      case OverrideType.kNone:
      default:
        return this.unigrams[this.selectedIndex_].score;
    }
  }

  /**
   * Whether the node is overridden.
   */
  get isOverridden(): boolean {
    return this.overrideType_ !== OverrideType.kNone;
  }

  /**
   * Resets the node to its original state.
   */
  reset() {
    this.selectedIndex_ = 0;
    this.overrideType_ = OverrideType.kNone;
  }

  /**
   * Selects a unigram to override the node.
   * @param value The value of the unigram to select.
   * @param type The type of override.
   * @returns True if the unigram was found and selected, false otherwise.
   */
  selectOverrideUnigram(value: string, type: OverrideType): boolean {
    // assert(type !==  OverrideType.kNone);
    for (let i = 0; i < this.unigrams.length; i++) {
      if (this.unigrams[i].value === value) {
        this.selectedIndex_ = i;
        this.overrideType_ = type;
        return true;
      }
    }
    return false;
  }

  /**
   * A sufficiently high score to cause the walk to go through an overriding
   * node. Although this can be 0, setting it to a positive value has the
   * desirable side effect that it reduces the competition of "free-floating"
   * multiple-character phrases. For example, if the user override for reading
   * "a b c" is "A B c", using the uppercase as the overriding node, now the
   * standalone c may have to compete with a phrase with reading "bc", which in
   * some pathological cases may actually cause the shortest path to be A->bc,
   * especially when A and B use the zero overriding score, as they leave "c"
   * alone to compete with "bc", and whether the path A-B is favored now solely
   * depends on that competition. A positive value favors the route A->B, which
   * gives "c" a better chance.
   */
  static kOverridingScore: number = 42;
}

/**
 * The result of a walk on the reading grid.
 * @class
 */
export class WalkResult {
  constructor(
    public readonly nodes: Node[],
    public readonly vertices: number,
    public readonly edges: number,
    public readonly elapsedMicroseconds: number,
    public readonly totalReadings: number
  ) {}

  /**
   * The values of the nodes as a list of strings.
   * @returns A list of strings.
   */
  valuesAsStrings(): string[] {
    const result: string[] = [];

    for (const node of this.nodes) {
      result.push(node.value);
    }
    return result;
  }

  /**
   * The readings of the nodes as a list of strings.
   * @returns A list of strings.
   */
  readingsAsStrings(): string[] {
    const result: string[] = [];

    for (const node of this.nodes) {
      result.push(node.reading);
    }
    return result;
  }

  /**
   * Finds the node at a given cursor position.
   * @param cursor The cursor position.
   * @returns A tuple containing the found node, the cursor index, and the node index.
   */
  findNodeAt(
    cursor: number
  ): Readonly<
    [
      Node | undefined /* found node */,
      number /* cursor index */,
      number | undefined /* node index */
    ]
  > {
    if (this.nodes.length === 0) {
      return [undefined, 0, undefined];
    }
    if (cursor > this.totalReadings) {
      return [undefined, 0, undefined];
    }
    if (cursor === 0) {
      return [this.nodes[0], this.nodes[0].spanningLength, 0];
    }
    if (cursor >= this.totalReadings - 1) {
      return [
        this.nodes[this.nodes.length - 1],
        this.totalReadings,
        this.nodes.length - 1,
      ];
    }
    let accumulated = 0;
    let nodeIndex = 0;
    for (const node of this.nodes) {
      accumulated += node.spanningLength;
      nodeIndex++;
      if (accumulated > cursor) {
        return [node, accumulated, nodeIndex];
      }
    }
    return [undefined, 0, undefined];
  }
}

/**
 * Represents a candidate which has a reading and a value.
 * @class
 */
export class Candidate {
  constructor(
    /** The reading of the candidate. For example, when a user tries to input "你
    ", the reading is "ㄋㄧˇ" */
    public readonly reading: string,
    /** The value of the candidate. For example, when a user tries to input "你"
     * with "ㄋㄧˇ", "你" is the value.  */
    public readonly value: string,
    /** The exact text displayed in the candidate windows. For example, we may
     * have multiple duplicated candidate whose value is "你", but the displayed
     * text could be "你 1", "你 2" and so on. */
    public readonly displayedText: string
  ) {}
}

/**
 * A span in the reading grid.
 * @class
 */
export class Span {
  nodes_: (Node | undefined)[] = [];
  maxLength_: number = 0;

  constructor() {
    this.nodes_.fill(undefined, 0, ReadingGrid.kMaximumSpanLength);
  }

  /**
   * The maximum length of the nodes in the span.
   */
  get maxLength(): number {
    return this.maxLength_;
  }

  /**
   * Clears the span.
   */
  clear() {
    this.nodes_.fill(undefined, 0, ReadingGrid.kMaximumSpanLength);
    this.maxLength_ = 0;
  }

  /**
   * Adds a node to the span.
   * @param node The node to add.
   */
  add(node: Node) {
    this.nodes_[node.spanningLength - 1] = node;

    if (node.spanningLength >= this.maxLength_) {
      this.maxLength_ = node.spanningLength;
    }
  }

  /**
   * Removes nodes of a certain length or longer.
   * @param length The length to remove.
   */
  removeNodesOfOrLongerThan(length: number) {
    // assert(length > 0 && length <= ReadingGrid.kMaximumSpanLength);
    for (let i = length - 1; i < ReadingGrid.kMaximumSpanLength; ++i) {
      this.nodes_[i] = undefined;
    }
    this.maxLength_ = 0;
    if (length === 1) {
      return;
    }

    let i = length - 2;
    while (true) {
      if (this.nodes_[i] !== undefined) {
        this.maxLength_ = i + 1;
        return;
      }

      if (i === 0) {
        return;
      }

      --i;
    }
  }

  /**
   * Returns the node of a certain length.
   * @param length The length of the node.
   * @returns The node of the given length.
   */
  nodeOf(length: number): Node | undefined {
    // assert(length > 0 && length <= ReadingGrid.kMaximumSpanLength);
    return this.nodes_[length - 1];
  }
}

/**
 * A language model that ranks unigrams by score.
 * @class
 * @implements {LanguageModel}
 */
export class ScoreRankedLanguageModel implements LanguageModel {
  constructor(private lm_: LanguageModel) {}

  getUnigrams(key: string): Unigram[] {
    throw new Error("Method not implemented.");
  }
  hasUnigrams(key: string): boolean {
    throw new Error("Method not implemented.");
  }
}

/**
 * A node in a span.
 * @class
 */
export class NodeInSpan {
  constructor(public readonly node: Node, public readonly spanIndex: number) {}
}

// class Vertex {
//   edges: Vertex[] = [];
//   /** Used during topological-sort. */
//   topologicallySorted = false;
//   /**
//    * Used during shortest-path computation. We are actually computing the path
//    * with the *largest* weight, hence distance's initial value being negative
//    * infinity. If we were to compute the *shortest* weight/distance, we would
//    * have initialized this to infinity.
//    */
//   distance: number = Number.NEGATIVE_INFINITY;
//   prev: Vertex | undefined = undefined;

//   constructor(public node: Node) {}
// }

// /**
//  * Cormen et al. 2001 explains the historical origin of the term "relax."
//  * @param u The source vertex.
//  * @param v The destination vertex.
//  */
// function Relax(u: Vertex, v: Vertex) {
//   // The distance from u to w is simply v's score.
//   const w = v.node.score;

//   // Since we are computing the largest weight, we update v's distance and prev
//   // if the current distance to v is *less* than that of u's plus the distance
//   // to v (which is represented by w).

//   if (v.distance < u.distance + w) {
//     v.distance = u.distance + w;
//     v.prev = u;
//   }
// }

// type VertexSpan = Vertex[];

// Topological-sorts a DAG that has a single root and returns the vertices in
// topological order. Here, a non-recursive version is implemented using our own
// stack and state definitions, so that we are not constrained by the current
// thread's stack size. This is the equivalent to this recursive version:
//
//  void TopologicalSort(Vertex* v) {
//    for (Vertex* nv : v->edges) {
//      if (!nv->topologicallySorted) {
//        dfs(nv, result);
//      }
//    }
//    v->topologicallySorted = true;
//    result.push_back(v);
//  }
//
// The recursive version is similar to the TOPOLOGICAL-SORT algorithm found in
// Cormen et al. 2001.
// function TopologicalSort(root: Vertex): Vertex[] {
//   class State {
//     v: Vertex;
//     iterIndex: number;
//     constructor(v: Vertex, iterIndex: number = 0) {
//       this.v = v;
//       this.iterIndex = iterIndex;
//     }
//   }

//   const result: Vertex[] = [];
//   const stack: State[] = [];
//   stack.push(new State(root));

//   while (stack.length > 0) {
//     const state = stack[stack.length - 1];
//     const v = state.v;
//     if (state.iterIndex < state.v.edges.length) {
//       const nv = state.v.edges[state.iterIndex];
//       state.iterIndex++;
//       if (!nv.topologicallySorted) {
//         stack.push(new State(nv));
//         continue;
//       }
//     }
//     v.topologicallySorted = true;
//     result.push(v);
//     stack.pop();
//   }
//   return result;
// }

function GetEpochNowInMicroseconds(): number {
  return new Date().getTime();
}
