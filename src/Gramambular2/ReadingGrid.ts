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
    // TODO
  }

  get length(): number {
    return 0;
  }

  get cursor(): number {
    return this.cursor_;
  }

  set cursor(cursor: number) {
    // TODO
  }

  get readingSeparator(): string {
    return this.separator_;
  }

  set readingSeparator(readingSeparator: string) {
    this.separator_ = readingSeparator;
  }

  insertReading(reading: string): boolean {
    return false;
  }

  /**
   * Delete the reading before the cursor, like Backspace. Cursor will decrement
   * by one.
   */
  deleteReadingBeforeCursor(): boolean {
    // TODO
    return false;
  }

  /**
   * Delete the reading after the cursor, like Del. Cursor is unmoved.
   */
  deleteReadingAfterCursor(): boolean {
    // TODO
    return false;
  }

  static kMaximumSpanLength = 6;
  static kDefaultSeparator = "-";

  walk(): WalkResult {
    // TODO
    return new WalkResult([], 0, 0, 0);
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
    // TODO
  }

  private hasNodeAt(loc: number, readingLen: number, reading: string): boolean {
    // TODO
    return false;
  }

  private update() {
    // TODO
  }

  // Internal implementation of overrideCandidate, with an optional reading.
  private overrideCandidate(
    loc: number,
    reading: string,
    value: string,
    overrideType: OverrideType
  ): boolean {
    // TODO
    return false;
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
