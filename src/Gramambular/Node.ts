import { KeyValuePair } from "./KeyValuePair";
import { Unigram } from "./Unigram";

export const kSelectedCandidateScore: number = 99;

export class Node {
  private key_: string;
  private score_: number = 0.0;

  private unigrams_: Unigram[];
  private candidates_: KeyValuePair[] = [];
  private valueUnigramIndexMap_: Map<string, number> = new Map();
  private selectedUnigramIndex_: number = 0;

  constructor(key: string, unigrams: Unigram[]) {
    this.key_ = key;

    let sortedUnigrams = unigrams.sort((a, b) => b.score - a.score);
    this.unigrams_ = sortedUnigrams;

    if (sortedUnigrams.length > 0) {
      this.score_ = sortedUnigrams[0].score;
    }

    for (let i = 0; i < sortedUnigrams.length; i++) {
      let unigram = sortedUnigrams[i];
      this.valueUnigramIndexMap_.set(unigram.keyValue.value, i);
      this.candidates_.push(unigram.keyValue);
    }
  }

  get candidates(): KeyValuePair[] {
    return this.candidates_;
  }

  selectCandidateAtIndex(index: number): void {
    if (index >= this.unigrams_.length) {
      this.selectedUnigramIndex_ = 0;
    } else {
      this.selectedUnigramIndex_ = index;
    }

    this.score_ = kSelectedCandidateScore;
  }

  resetCandidate(): void {
    this.selectedUnigramIndex_ = 0;
    if (this.unigrams_.length > 0) {
      this.score_ = this.unigrams_[0].score;
    }
  }

  selectFloatingCandidateAtIndex(index: number, score: number): void {
    if (index >= this.unigrams_.length) {
      this.selectedUnigramIndex_ = 0;
    } else {
      this.selectedUnigramIndex_ = index;
    }

    this.score_ = score;
  }

  get key(): string {
    return this.key_;
  }

  get score(): number {
    return this.score_;
  }

  toString(): string {
    return "(Node " + this.key_ + "," + this.score + ")";
  }

  scoreForCandidate(candidate: string): number {
    for (let unigram of this.unigrams_) {
      if (unigram.keyValue.value === candidate) {
        return unigram.score;
      }
    }
    return 0.0;
  }

  get highestUnigramScore(): number {
    return this.unigrams_.length === 0 ? 0.0 : this.unigrams_[0].score;
  }

  get currentKeyValue(): KeyValuePair {
    if (this.selectedUnigramIndex_ >= this.unigrams_.length) {
      return new KeyValuePair();
    }
    return this.candidates_[this.selectedUnigramIndex_];
  }
}
