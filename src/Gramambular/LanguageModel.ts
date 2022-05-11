import { Bigram } from "./Bigram";
import { Unigram } from "./Unigram";

export interface LanguageModel {
  bigramsForKey?(preceedingKey: string, key: string): Bigram[];
  unigramsForKey?(key: string): Unigram[];
  hasUnigramsForKey(key: string): boolean;
}
