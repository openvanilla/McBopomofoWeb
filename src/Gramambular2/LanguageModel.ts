/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */
export interface LanguageModel {
  getUnigrams(key: string): Unigram[];
  hasUnigrams(key: string): boolean;
}

export class Unigram {
  public value: string;
  public score: number;

  constructor(value: string = "", score: number = 0) {
    this.value = value;
    this.score = score;
  }
}
