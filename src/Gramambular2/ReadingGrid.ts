/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { assert } from "console";
import { isUndefined } from "lodash";
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
 */
export class ReadingGrid {
  private cursor_: number = 0;
  private separator_: string = ReadingGrid.kDefaultSeparator;
  private spans_: Span[] = [];
  private readings_: string[] = [];
  private lm_: LanguageModel;

  constructor(lm: LanguageModel) {
    this.lm_ = lm;
  }

  clear() {
    this.cursor_ = 0;
    this.readings_ = [];
    this.spans_ = [];
  }

  get length(): number {
    return this.readings_.length;
  }

  get cursor(): number {
    return this.cursor_;
  }

  set cursor(cursor: number) {
    this.cursor_ = cursor;
  }

  get readingSeparator(): string {
    return this.separator_;
  }

  set readingSeparator(readingSeparator: string) {
    this.separator_ = readingSeparator;
  }

  insertReading(reading: string): boolean {
    if (reading.length == 0 || reading === this.separator_) {
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
   */
  deleteReadingAfterCursor(): boolean {
    if (this.cursor_ === this.readings_.length) {
      return false;
    }
    this.readings_.splice(this.cursor_, 1);
    this.shrinkGridAt(this.cursor_);
    this.update();
    return false;
  }

  static kMaximumSpanLength = 6;
  static kDefaultSeparator = "-";

  /**
   * Find the weightiest path in the grid graph. The path represents the most
   * likely hidden chain of events from the observations. We use the
   * DAG-SHORTEST-PATHS algorithm in Cormen et al. 2001 to compute such path.
   * Instead of computing the path with the shortest distance, though, we
   * compute the path with the longest distance (so the weightiest), since with
   * log probability a larger value means a larger probability. The algorithm
   * runs in O(|V| + |E|) time for G = (V, E) where G is a DAG. This means the
   * walk is fairly economical even when the grid is large.
   */
  walk(): WalkResult {
    let result = new WalkResult([], 0, 0, 0);
    if (this.spans_.length === 0) {
      return result;
    }
    let start = GetEpochNowInMicroseconds();
    let vspans: VertexSpan[] = [];
    let vertices = 0;
    let edges = 0;

    for (let i = 0, len = this.spans_.length; i < len; ++i) {
      let span = this.spans_[i];
      for (let j = 1, maxSpanLen = span.maxLength; j <= maxSpanLen; ++j) {
        let p = span.nodeOf(j);
        if (p != undefined) {
          vspans[i].push(p);
          ++vertices;
        }
      }
    }

    result.vertices = vertices;
    let terminal = new Vertex(new Node("_TERMINAL_", 0, []));

    for (let i = 0, vspansLen = vspans.length; i < vspansLen; ++i) {
      for (let v of vspans[i]) {
        let nextVertexPos = i + v.node.spanningLength;
        if (nextVertexPos == vspansLen) {
          v.edges.push(terminal);
          continue;
        }

        for (let nv of vspans[nextVertexPos]) {
          v.edges.push(nv);
          ++edges;
        }
      }
    }
    result.edges = edges;

    let root = new Vertex(new Node("_ROOT_", 0, []));
    root.distance = 0;
    for (let v of vspans[0]) {
      root.edges.push(v);
    }

    let ordered = TopologicalSort(root);
    let reversed = ordered.reverse();
    for (let u of reversed) {
      for (let v of u.edges) {
        Relax(u, v);
      }
    }

    let walked: Node[] = [];
    let totalReadingLen = 0;
    let it = terminal;
    while (it.prev != undefined) {
      walked.push(it.prev.node);
      it = it.prev;
      totalReadingLen += it.node.spanningLength;
    }
    assert(totalReadingLen === this.readings_.length);
    assert(walked.length >= 2);
    walked.slice(0, 1);
    walked.reverse();

    result.nodes = walked;
    result.elapsedMicroseconds = GetEpochNowInMicroseconds() - start;
    return result;
  }

  /**
   * Returns all candidate values at the location. If spans are not empty and
   * loc is at the end of the spans, (loc - 1) is used, so that the caller does
   * not have to care about this boundary condition.
   */
  candidatesAt(loc: number): Candidate[] {
    // TODO
    return [];
  }

  /**
   * Adds weight to the node with the unigram that has the designated candidate
   * value and applies the desired override type, essentially resulting in user
   * override. An overridden node would influence the grid walk to favor walking
   * through it.
   */
  overrideCandidate(
    loc: number,
    candidate: Candidate,
    overrideType: OverrideType = OverrideType.kOverrideValueWithHighScore
  ): boolean {
    // TODO
    return false;
  }

  /**
   * Same as the method above, but since the string candidate value is used, if
   * there are multiple nodes (of different spanning length) that have the same
   * unigram value, it's not guaranteed which node will be selected.
   */
  overrideCandidateWithString(
    loc: number,
    candidate: string,
    overrideType: OverrideType = OverrideType.kOverrideValueWithHighScore
  ): boolean {
    // TODO
    return false;
  }

  private expandGridAt(loc: number) {
    // TODO
  }

  private shrinkGridAt(loc: number) {
    // TODO
  }

  private removeAffectedNodes(loc: number) {
    // TODO
  }

  private insert(loc: number, node: Node) {
    // TODO
  }

  private combineReading(reading: string[]): string {
    return "";
    // TODO
  }

  private hasNodeAt(loc: number, readingLen: number, reading: string): boolean {
    // TODO
    return false;
  }

  private update() {
    // TODO
  }

  /**
   * Find all nodes that overlap with the location. The return value is a list
   * of nodes along with their starting location in the grid.
   */
  overlappingNodesAt(loc: number) {
    return [];
  }
}

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

export class Node {
  reading_: string;
  spanningLength_: number;
  unigrams_: Unigram[];
  overrideType_: OverrideType = OverrideType.kNone;

  constructor(reading: string, spanningLength: number, unigrams: Unigram[]) {
    this.reading_ = reading;
    this.spanningLength_ = spanningLength;
    this.unigrams_ = unigrams;
  }

  get reading(): string {
    return this.reading_;
  }

  get spanningLength(): number {
    return this.spanningLength_;
  }

  get unigrams(): Unigram[] {
    return this.unigrams_;
  }

  get currentUnigram(): Unigram {
    return new Unigram("", 0);
  }

  get value(): string {
    // TODO
    return "";
  }

  get score(): number {
    // TODO
    return 0;
  }

  get isOverridden(): boolean {
    // TODO
    return false;
  }

  reset() {
    // TODO
  }

  selectOverrideUnigram(value: string, type: OverrideType) {
    // TODO
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

export class WalkResult {
  nodes: Node[];
  vertices: number;
  edges: number;
  elapsedMicroseconds: number;

  constructor(
    nodes: Node[],
    vertices: number,
    edges: number,
    elapsedMicroseconds: number
  ) {
    this.nodes = nodes;
    this.vertices = vertices;
    this.edges = edges;
    this.elapsedMicroseconds = elapsedMicroseconds;
  }

  valuesAsStrings(): string[] {
    // TODO
    return [];
  }

  readingsAsStrings(): string[] {
    // TODO
    return [];
  }
}

export class Candidate {
  private reading_: string;
  private value_: string;

  constructor(reading: string, value: string) {
    this.reading_ = reading;
    this.value_ = value;
  }

  get reading(): string {
    return this.reading_;
  }

  get value(): string {
    return this.value_;
  }
}

export class Span {
  nodes_: Node[] = [];
  maxLength_: number = 0;

  get nodes(): Node[] {
    return this.nodes_;
  }
  get maxLength(): number {
    return this.maxLength_;
  }

  clear() {
    // TODO
  }

  add(node: Node) {
    // TODO
  }

  removeNodesOfOrLongerThan(length: number) {
    // TODO
  }

  nodeOf(length: number) {
    // TODO
  }
}

export class ScoreRankedLanguageModel implements LanguageModel {
  private lm_: LanguageModel;

  constructor(lm: LanguageModel) {
    this.lm_ = lm;
  }

  getUnigrams(key: string): Unigram[] {
    throw new Error("Method not implemented.");
  }
  hasUnigrams(key: string): boolean {
    throw new Error("Method not implemented.");
  }
}

export class NodeInSpan {
  node: Node;
  spanIndex: number;

  constructor(node: Node, spanIndex: number) {
    this.node = node;
    this.spanIndex = spanIndex;
  }
}

class Vertex {
  node: Node;
  edges: Vertex[] = [];
  /** Used during topological-sort. */
  topologicallySorted = false;
  /**
   * Used during shortest-path computation. We are actually computing the path
   * with the *largest* weight, hence distance's initial value being negative
   * infinity. If we were to compute the *shortest* weight/distance, we would
   * have initialized this to infinity.
   */
  distance: number = Number.MIN_VALUE;
  prev: Vertex | undefined = undefined;

  constructor(node: Node) {
    this.node = node;
  }
}

/**
 * Cormen et al. 2001 explains the historical origin of the term "relax."
 */
function Relax(u: Vertex, v: Vertex) {
  // The distance from u to w is simply v's score.
  let w = v.node.score;
  // Since we are computing the largest weight, we update v's distance and prev
  // if the current distance to v is *less* than that of u's plus the distance
  // to v (which is represented by w).
  if (v.distance < u.distance + w) {
    v.distance = u.distance + w;
    v.prev = u;
  }
}

type VertexSpan = Vertex[];

function TopologicalSort(root: Vertex): Vertex[] {
  class State {
    v: Vertex;
    iterIndex: number;
    constructor(v: Vertex, iterIndex: number = 0) {
      this.v = v;
      this.iterIndex = iterIndex;
    }
  }

  let result: Vertex[] = [];
  let stack: State[] = [];
  stack.push(new State(root));

  while (stack.length > 0) {
    let state = stack[stack.length - 1];
    let v = state.v;
    if (state.iterIndex < state.v.edges.length) {
      let nv = state.v.edges[state.iterIndex];
      state.iterIndex++;
      if (!nv.topologicallySorted) {
        stack.push(new State(nv));
        continue;
      }
    }
    v.topologicallySorted = true;
    result.push(v);
    stack.pop();
  }
  return result;
}

function GetEpochNowInMicroseconds(): number {
  return new Date().getTime();
}
