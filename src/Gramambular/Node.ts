import { Bigram } from "./Bigram";
import { KeyValuePair } from "./KeyValuePair";
import { LanguageModel } from "./LanguageModel";
import { Unigram } from "./Unigram";

export class Node {
  protected LM_: LanguageModel;

  protected key_: string;
  protected score_: number = 0.0;

  protected unigrams_: Unigram[];
  protected candidates_: KeyValuePair[] = [];
  protected valueUnigramIndexMap_: Map<string, number> = new Map();
  protected preceedingGramBigramMap_: Map<KeyValuePair, Bigram[]> = new Map();

  protected candidateFixed_: boolean = false;
  protected selectedUnigramIndex_: number = 0;

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

    for (let i = 0; i < bigrams.length; i++) {
      let bigram = bigrams[i];
      let list: Bigram[] = this.preceedingGramBigramMap_.get(
        bigram.preceedingKeyValue
      );

      if (list === undefined) {
        list = [];
      }
      list.push(bigram);
      this.preceedingGramBigramMap_.set(bigram.preceedingKeyValue, list);
    }
  }

  isCandidateFixed = (): boolean => this.candidateFixed_;

  candidates = (): KeyValuePair[] => this.candidates_;

  selectCandidateAtIndex(index: number, fix: boolean): void {
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

  key = (): string => this.key_;

  score = (): number => this.score_;

  highestUnigramScore = (): number =>
    this.unigrams_.length == 0 ? 0.0 : this.unigrams_[0].score;

  currentKeyValue() {
    if (this.selectedUnigramIndex_ >= this.unigrams_.length) {
      return new KeyValuePair();
    } else {
      return this.candidates_[this.selectedUnigramIndex_];
    }
  }
}
