import { NodeAnchor } from "../Gramambular";

class Override {
  count: number = 0;
  timestamp: number = 0;
}

class Observation {
  count: number = 0;
  overrides: Map<string, Override> = new Map();

  update(candidate: string, timestamp: number): void {
    this.count++;
    let o = this.overrides[candidate] ?? new Override();
    o.timestamp = timestamp;
    o.count++;
    this.overrides[candidate] = o;
  }
}

class KeyObservationPair {
  key: string = "";
  observation: Observation = new Observation();

  constructor(key: string, observation: Observation) {
    this.key = key;
    this.observation = observation;
  }
}

const DecayThreshould: number = 1.0 / 1048576.0;

function Score(
  eventCount: number,
  totalCount: number,
  eventTimestamp: number,
  timestamp: number,
  lambda: number
): number {
  let decay = (timestamp - eventTimestamp) * lambda;
  if (decay < DecayThreshould) {
    return 0.0;
  }

  let prob = eventCount / totalCount;
  return prob * decay;
}

function IsEndingPunctuation(value: string): boolean {
  return (
    value == "，" ||
    value == "。" ||
    value == "！" ||
    value == "？" ||
    value == "」" ||
    value == "』" ||
    value == "”" ||
    value == "”"
  );
}

function WalkedNodesToKey(
  walkedNodes: NodeAnchor[],
  cursorIndex: number
): string {
  let s: string = "";
  let n: NodeAnchor[] = [];
  let ll: number = 0;

  for (var i = 0; i < walkedNodes.length; i++) {
    let nn = walkedNodes[i];
    n.push(nn);
    ll += nn.spanningLength;
    if (ll >= cursorIndex) {
      break;
    }
  }

  if (n.length == 0) {
    return "";
  }

  let r = n.length - 1;
  let current = n[r].node.currentKeyValue.key ?? "";
  if (r >= 0) {
    let value = n[r].node.currentKeyValue.value ?? "";
    if (IsEndingPunctuation(value)) {
      s += "()";
      r = -1;
    } else {
      s += "(" + n[r].node.currentKeyValue.key + "," + value + ")";
      r--;
    }
  } else {
    s += "()";
  }

  let prev = s;
  s = "";

  if (r >= 0) {
    let value = n[r].node.currentKeyValue.value ?? "";
    if (IsEndingPunctuation(value)) {
      s += "()";
      r = -1;
    } else {
      s += "(" + n[r].node.currentKeyValue.key + "," + value + ")";
      r--;
    }
  } else {
    s += "()";
  }
  let anterior = s;
  s = "";
  s += "(" + anterior + "," + prev + "," + current + ")";
  return s;
}

class UserOverrideModel {
  constructor(capacity: number, decayConstant: number) {
    this.capacity_ = capacity;
    this.decayExponent_ = Math.log(0.5) / decayConstant;
  }

  observe(
    walkedNodes: NodeAnchor[],
    cursorIndex: number,
    candidate: string,
    timestamp: number
  ) {
    let key = WalkedNodesToKey(walkedNodes, cursorIndex);
    let observation = this.lruMap_[key];
    if (observation === undefined) {
      let observation = new Observation();
      observation.update(candidate, timestamp);
      let keyValuePair = new KeyObservationPair(key, observation);
      this.lruList_.splice(0, 0, keyValuePair);
      this.lruMap_[key] = observation;

      if (this.lruList_.length > this.capacity_) {
        let lastKeyValuePair = this.lruList_[this.lruList_.length - 1];
        delete this.lruMap_[lastKeyValuePair.key];
        this.lruList_.pop();
      }
    } else {
      observation.update(timestamp);
      this.lruList_.splice(0, 0, new KeyObservationPair(key, observation));
      this.lruMap_[key] = observation;
    }
  }

  suggest(
    walkedNodes: NodeAnchor[],
    cursorIndex: number,
    timestamp: number
  ): string {
    let key = WalkedNodesToKey(walkedNodes, cursorIndex);
    let observation: Observation = this.lruMap_[key];
    if (observation === undefined) {
      return "";
    }

    let candidate = "";
    let score = 0;
    let overrides = observation.overrides;

    overrides.forEach((o, key) => {
      let overrideScore = Score(
        o.count,
        observation.count,
        o.timestamp,
        timestamp,
        this.decayExponent_
      );

      if (overrideScore != 0.0 && overrideScore > score) {
        candidate = key;
        score = overrideScore;
      }
    });

    return candidate;
  }

  private capacity_: number;
  private decayExponent_: number;
  private lruList_: KeyObservationPair[] = [];
  private lruMap_: Map<string, Observation> = new Map();
}
