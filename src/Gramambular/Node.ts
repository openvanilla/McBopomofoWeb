import { Bigram } from "./Bigram";
import { KeyValuePair } from "./KeyValuePair";
import { LanguageModel } from "./LanguageModel";
import { Unigram } from "./Unigram";

export class Node {
  private LM_: LanguageModel;

  private key_: string;
  private score_: number = 0.0;

  private unigrams_: Unigram[];
  private candidates_: KeyValuePair[] = [];
  private valueUnigramIndexMap_: Map<string, number> = new Map();
  private preceedingGramBigramMap_: Map<KeyValuePair, Bigram[]> = new Map();

  private candidateFixed_: boolean = false;
  private selectedUnigramIndex_: number = 0;

  constructor(key: string, unigrams: Unigram[], bigrams: Bigram[]) {
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

    bigrams.forEach((bigram) => {
      let list: Bigram[] = this.preceedingGramBigramMap_.get(
        bigram.preceedingKeyValue
      );

      if (list === undefined) list = [];

      list.push(bigram);
      this.preceedingGramBigramMap_.set(bigram.preceedingKeyValue, list);
    });
  }

  get isCandidateFixed(): boolean {
    return this.candidateFixed_;
  }

  get candidates(): KeyValuePair[] {
    return this.candidates_;
  }

  selectCandidateAtIndex(index: number, fix: boolean = false): void {
    if (index >= this.unigrams_.length) {
      this.selectedUnigramIndex_ = 0;
    } else {
      this.selectedUnigramIndex_ = index;
    }

    this.candidateFixed_ = fix;
    this.score_ = 99;
  }

  resetCandidate(): void {
    this.selectedUnigramIndex_ = 0;
    this.candidateFixed_ = false;
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

    this.candidateFixed_ = false;
    this.score_ = score;
  }

  get key(): string {
    return this.key_;
  }

  get score(): number {
    return this.score_;
  }

  scoreForCandidate(candidate: string): number {
    for (let unigram of this.unigrams_) {
      if (unigram.keyValue.value == candidate) {
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
