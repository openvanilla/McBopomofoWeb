import { KeyValuePair } from "./KeyValuePair";

export class Unigram {
  public keyValue: KeyValuePair;
  public score: number;

  constructor(keyValue: KeyValuePair, score: number = 0) {
    this.keyValue = keyValue;
    this.score = score;
  }

  toString(): string {
    return "(" + this.keyValue.toString() + "," + this.score + ")";
  }

  equals(another: Unigram): boolean {
    return (
      this.keyValue.equals(another.keyValue) && this.score === another.score
    );
  }

  isGreaterThan(another: Unigram): boolean {
    if (this.keyValue.isGreaterThan(another.keyValue)) {
      return true;
    } else if (this.keyValue.equals(another.keyValue)) {
      return this.score > another.score;
    }
    return false;
  }

  isLessThan(another: Unigram): boolean {
    if (this.keyValue.isLessThan(another.keyValue)) {
      return true;
    } else if (this.keyValue.equals(another.keyValue)) {
      return this.score < another.score;
    }
    return false;
  }
}
