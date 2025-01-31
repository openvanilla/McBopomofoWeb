/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

/**
 * Represents a language model interface for retrieving unigrams.
 * A language model provides access to unigram data based on string keys.
 *
 * The interface is used to abstract different implementations of language models
 * that can provide unigram lookup functionality.
 *
 * @interface LanguageModel
 */

export interface LanguageModel {
  /**
   * Retrieves an array of Unigram objects for the specified key.
   *
   * @param key - The string key to look up unigrams for
   * @returns An array of Unigram objects matching the key
   */
  getUnigrams(key: string): Unigram[];

  /**
   * Whether Unigrams exist for the specified key.
   *
   * @param key - The string key to look up unigrams for
   * @returns Whether Unigrams exist for the key
   */
  hasUnigrams(key: string): boolean;
}

/**
 * Represents a unigram in a language model with a value and an associated
 * score. A unigram is a single unit (typically a word or character) in natural
 * language processing.
 */
export class Unigram {
  readonly value: string;
  readonly score: number;

  constructor(value: string = "", score: number = 0) {
    this.value = value;
    this.score = score;
  }
}
