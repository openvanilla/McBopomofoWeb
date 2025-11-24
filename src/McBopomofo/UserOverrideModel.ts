/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { WalkResult, Node } from "../Gramambular2";

// Fully decay after about 20 generations.
const kDecayThreshold: number = 1.0 / 1048576.0;
const kEmptyNodeString: string = "()";

// A scoring function that balances between "recent but infrequently observed"
// and "old but frequently observed".
function Score(
  eventCount: number,
  totalCount: number,
  eventTimestamp: number,
  timestamp: number,
  lambda: number
): number {
  const decay = Math.exp((timestamp - eventTimestamp) * lambda);
  if (decay < kDecayThreshold) {
    return 0.0;
  }

  const prob = eventCount / totalCount;
  return prob * decay;
}

function CombineReadingValue(reading: string, value: string) {
  return "(" + reading + "," + value + ")";
}

function IsPunctuation(node: Node) {
  const reading = node.reading;
  return reading.length > 0 && reading[0] === "_";
}

// Form the observation key from the nodes of a walk. This goes backward, but
// we are using a const_iterator, the "end" here should be a .cbegin() of a
// vector.
function FormObservationKey(nodes: Node[], head: number, end: number): string {
  if (nodes.length === 0) {
    return "";
  }

  // Using the top unigram from the head node. Recall that this is an
  // observation for *before* the user override, and when we provide
  // a suggestion, this head node is never overridden yet.

  let headStr = "";
  if (nodes[head] !== undefined) {
    headStr = CombineReadingValue(
      nodes[head].reading,
      nodes[head].unigrams[0].value
    );
  }

  // For the next two nodes, use their current unigram values. If it's a
  // punctuation, we ignore the reading and the value altogether and treat
  // it as if it's like the beginning of the sentence.
  let prevStr = "";
  let prevIsPunctuation = false;

  if (head !== end) {
    --head;
    prevIsPunctuation = IsPunctuation(nodes[head]);
    if (prevIsPunctuation) {
      prevStr = kEmptyNodeString;
    } else if (nodes[head] !== undefined) {
      prevStr = CombineReadingValue(
        nodes[head].reading,
        nodes[head].currentUnigram.value
      );
    }
  } else {
    prevStr = kEmptyNodeString;
  }

  let anteriorStr = "";
  if (head !== end && !prevIsPunctuation) {
    --head;
    if (IsPunctuation(nodes[head])) {
      anteriorStr = kEmptyNodeString;
    } else if (nodes[head] !== undefined) {
      anteriorStr = CombineReadingValue(
        nodes[head].reading,
        nodes[head].currentUnigram.value
      );
    }
  } else {
    anteriorStr = kEmptyNodeString;
  }

  return anteriorStr + "-" + prevStr + "-" + headStr;
}

export class Suggestion {
  constructor(
    public readonly candidate: string,
    public readonly forceHighScoreOverride: boolean
  ) {}
}

class Override {
  count = 0;
  timestamp = 0;
  forceHighScoreOverride = false;
}

class Observation {
  count = 0;
  overrides: { [id: string]: Override } = {};

  update(
    candidate: string,
    timestamp: number,
    forceHighScoreOverride: boolean
  ) {
    this.count++;
    let o = this.overrides[candidate];
    if (!o) {
      o = new Override();
    }
    o.timestamp = timestamp;
    o.count++;
    o.forceHighScoreOverride = forceHighScoreOverride;
    this.overrides[candidate] = o;
  }
}

class KeyObservationPair {
  key: string = "";
  observation: Observation = new Observation();
}

export class UserOverrideModel {
  m_capacity: number;
  m_decayExponent: number;
  m_lruList: KeyObservationPair[] = [];
  m_lruMap: { [id: string]: KeyObservationPair } = {};

  constructor(capacity: number, decayConstant: number) {
    this.m_capacity = capacity;
    this.m_decayExponent = Math.log(0.5) / decayConstant;
  }

  public observe(
    walkBeforeUserOverride: WalkResult | undefined,
    walkAfterUserOverride: WalkResult | undefined,
    cursor: number,
    timestamp: number
  ) {
    if (
      walkBeforeUserOverride === undefined ||
      walkAfterUserOverride === undefined ||
      walkBeforeUserOverride.nodes.length === 0 ||
      walkAfterUserOverride.nodes.length === 0
    ) {
      // Sanity check.
      return;
    }

    if (
      walkBeforeUserOverride.totalReadings !==
      walkAfterUserOverride.totalReadings
    ) {
      return;
    }

    // We first infer what the user override is.
    const result = walkAfterUserOverride.findNodeAt(cursor);
    const currentNode = result[0];
    let actualCursor = result[1];
    const currentNodeIndex = result[2];
    if (currentNode === undefined || currentNodeIndex === undefined) {
      return;
    }

    // Based on previous analysis, we found it meaningless to handle phrases
    // over 3 characters.
    if (currentNode.spanningLength > 3) {
      return;
    }

    // Now we need to find the head node in the previous walk (that is, before
    // the user override). Remember that actualCursor now is actually *past*
    // the current node, so we need to decrement by 1.
    if (actualCursor === 0) {
      // Shouldn't happen.
      return;
    }
    --actualCursor;
    const previousResult = walkBeforeUserOverride.findNodeAt(actualCursor);
    const prevHeadNode = previousResult[0];
    const prevIndex = previousResult[2];
    if (prevHeadNode === undefined || prevIndex === undefined) {
      return;
    }

    // Now we have everything. We want to handle the following cases:
    // (1) both prev and current head nodes represent an n-char phrase.
    // (2) current head node is a 2-/3-char phrase but prev head node and
    //     the nodes that lead to the prev head node are 1-char phrases.
    // (3) current head node is a 1-char phrase but the prev head node is
    //     a phrase of multi-char phrases.
    //
    // (1) is the simplest case. Our observation is based on the "walk before
    // user override", and we don't need to recommend force-high-score
    // overrides when we return such a suggestion. Example: overriding
    // "他姓[中]" with "他姓[鍾]".
    //
    // (2) is a case that UOM historically didn't handle properly. The
    // observation needs to be based on the walk before user override, but
    // we also need to recommend force-high-score override when we make the
    // suggestion, due to the fact (based on our data analysis) that many
    // n-char (esp. 2-char) phrases need to compete with individual chars
    // that together have higher score than the phrases themselves. Example:
    // overriding "增加[自][會]" with "增加[字彙]". Here [自][會] together have
    // higher score than the single unigram [字彙], and hence the boosting
    // here.
    //
    // (3) is a very special case where we need to base our observation on
    // the walk *after* user override. This is because when (3) happens, the
    // user intent is to break up a long phrase. We don't want to recommend
    // force-high-score overrides, which would cause the multi-char phrase
    // to lose over the user override all the time. For example (a somewhat
    // forced one): overriding "[三百元]" with "[參]百元".
    const forceHighScoreOverride =
      currentNode.spanningLength > prevHeadNode.spanningLength;
    const breakingUp =
      currentNode.spanningLength === 1 && prevHeadNode.spanningLength > 1;
    const nodeIndex = breakingUp ? currentNodeIndex : prevIndex;
    const nodes = breakingUp
      ? walkAfterUserOverride.nodes
      : walkBeforeUserOverride.nodes;

    const key = FormObservationKey(nodes, nodeIndex, 0);
    this.observeInner(
      key,
      currentNode.currentUnigram.value,
      timestamp,
      forceHighScoreOverride
    );
  }

  private observeInner(
    key: string,
    candidate: string,
    timestamp: number,
    forceHighScoreOverride: boolean
  ) {
    const keyObservationPair = this.m_lruMap[key];
    if (keyObservationPair === undefined) {
      const observation = new Observation();
      observation.update(candidate, timestamp, forceHighScoreOverride);
      const keyValuePair = new KeyObservationPair();
      keyValuePair.key = key;
      keyValuePair.observation = observation;

      this.m_lruList.splice(0, 0, keyValuePair);
      this.m_lruMap[key] = keyValuePair;

      if (this.m_lruList.length > this.m_capacity) {
        const lastKeyValuePair = this.m_lruList.pop();
        if (lastKeyValuePair !== undefined) {
          delete this.m_lruMap[lastKeyValuePair.key];
        }
      }
    } else {
      const index = this.m_lruList.indexOf(keyObservationPair);
      if (index > -1) {
        this.m_lruList.splice(index, 1);
      }

      this.m_lruList.splice(0, 0, keyObservationPair);
      keyObservationPair.observation.update(
        candidate,
        timestamp,
        forceHighScoreOverride
      );
      this.m_lruMap[key] = keyObservationPair;
    }
  }

  public suggest(
    currentWalk: WalkResult,
    cursor: number,
    timestamp: number
  ): Suggestion | undefined {
    const result = currentWalk.findNodeAt(cursor);
    const index = result[2];
    if (index !== undefined) {
      const key = FormObservationKey(currentWalk.nodes, index, 0);
      return this.suggestInner(key, timestamp);
    }
    return undefined;
  }

  suggestInner(key: string, timestamp: number): Suggestion {
    const mapIter = this.m_lruMap[key];
    if (!mapIter) {
      return new Suggestion("", false);
    }
    const observation = mapIter.observation;
    let candidate = "";
    let forceHighScoreOverride = false;
    let score = 0;
    for (const k in observation.overrides) {
      const o = observation.overrides[k];
      if (o === undefined) {
        continue;
      }
      const overrideScore = Score(
        o.count,
        observation.count,
        o.timestamp,
        timestamp,
        this.m_decayExponent
      );
      if (overrideScore === 0.0) {
        continue;
      }
      if (overrideScore > score) {
        candidate = k;
        forceHighScoreOverride = o.forceHighScoreOverride;
        score = overrideScore;
      }
    }

    return new Suggestion(candidate, forceHighScoreOverride);
  }
}
