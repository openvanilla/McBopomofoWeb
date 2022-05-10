import { KeyValuePair } from "./KeyValuePair";

export class Bigram {
  preceedingKeyValue: KeyValuePair;
  keyValue: KeyValuePair;
  score: number;

  constructor(
    keyValue: KeyValuePair,
    preceedingKeyValue: KeyValuePair,
    score: number = 0
  ) {
    this.keyValue = keyValue;
    this.preceedingKeyValue = preceedingKeyValue;
    this.score = score;
  }

  protected toString(): string {
    return (
      "(" + this.keyValue.toString() + "|" + this.preceedingKeyValue.toString(),
      "," + this.score + ")"
    );
  }

  protected equals(another: Bigram): boolean {
    return (
      this.preceedingKeyValue.equals(another.preceedingKeyValue) &&
      this.keyValue.equals(another.keyValue) &&
      this.score === another.score
    );
  }

  protected isGreaterThan(another: Bigram): boolean {
    if (this.preceedingKeyValue.isGreaterThan(another.preceedingKeyValue)) {
      return true;
    } else if (this.preceedingKeyValue.equals(another.preceedingKeyValue)) {
      if (this.keyValue.isGreaterThan(another.keyValue)) {
        return true;
      } else if (this.keyValue.equals(another.keyValue)) {
        return this.score > another.score;
      }
    }
    return false;
  }

  protected isLessThan(another: Bigram): boolean {
    if (this.preceedingKeyValue.isLessThan(another.preceedingKeyValue)) {
      return true;
    } else if (this.preceedingKeyValue.equals(another.preceedingKeyValue)) {
      if (this.keyValue.isLessThan(another.keyValue)) {
        return true;
      } else if (this.keyValue.equals(another.keyValue)) {
        return this.score < another.score;
      }
    }
    return false;
  }
}
