import { Bigram } from "./Bigram";
import { Unigram } from "./Unigram";

export interface LanguageModel {
  bigramsForKeys(preceedingKey: string, key: string): Bigram[];
  unigramsForKeys(preceedingKey: string, key: string): Unigram[];
  hasUnigramsForKey(key: string): boolean;
}
