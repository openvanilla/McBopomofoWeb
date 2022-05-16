import { Unigram } from "./Unigram";

export interface LanguageModel {
  unigramsForKey(key: string): Unigram[];
  hasUnigramsForKey(key: string): boolean;
}
