/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { LanguageModel, Unigram } from "../Gramambular2";
import { BopomofoSyllable } from "../Mandarin";

/**
 * The model for user phrases.
 */
export class UserPhrases implements LanguageModel {
  private userPhrases_: Map<string, string[]> = new Map();
  private onPhraseChange_: (map: Map<string, string[]>) => void = () => {};

  setUserPhrases(map: Map<string, string[]>): void {
    if (map === null || map === undefined) {
      return;
    }
    this.userPhrases_ = map;
  }

  setOnPhraseChange(callback: (map: Map<string, string[]>) => void): void {
    this.onPhraseChange_ = callback;
  }

  removeUserPhrase(key: string, phrase: string): void {
    let list = this.userPhrases_.get(key);
    if (list == undefined) {
      return;
    }
    if (list.includes(phrase)) {
      list.splice(list.indexOf(phrase), 1);
      this.userPhrases_.set(key, list);
      this.onPhraseChange_(this.userPhrases_);
    }
  }

  addUserPhrase(key: string, phrase: string): void {
    let list = this.userPhrases_.get(key);
    if (list != undefined) {
      if (list.includes(phrase)) {
        return;
      }
      list.push(phrase);
      this.userPhrases_.set(key, list);
    } else {
      list = [];
      list.push(phrase);
      this.userPhrases_.set(key, list);
    }
    this.onPhraseChange_(this.userPhrases_);
  }

  getUnigrams(key: string): Unigram[] {
    if (key === " ") {
      return [];
    }

    let result: Unigram[] = [];
    let list = this.userPhrases_.get(key);
    if (list != undefined) {
      for (let item of list) {
        const g = new Unigram(item, 0);
        result.push(g);
      }
    }
    return result;
  }

  hasUnigrams(key: string): boolean {
    if (key === " ") {
      return true;
    }
    let list = this.userPhrases_.get(key);
    if (list === undefined) return false;
    return list.length > 0;
  }
}

/**
 * The main language model.
 */
export class WebLanguageModel implements LanguageModel {
  private map_: any;
  private userPhrases_: UserPhrases = new UserPhrases();
  private excludedPhrases_: UserPhrases = new UserPhrases();

  private macroConverter_?: (input: string) => string | undefined;
  /** Sets the string converter. */
  public setMacroConverter(
    converter?: (input: string) => string | undefined
  ): void {
    this.macroConverter_ = converter;
  }

  public getMacroConverter():
    | ((input: string) => string | undefined)
    | undefined {
    return this.macroConverter_;
  }

  private converter_?: (input: string) => string | undefined;
  /** Sets the string converter. */
  public setConverter(converter?: (input: string) => string | undefined): void {
    this.converter_ = converter;
  }

  public getConverter(): ((input: string) => string | undefined) | undefined {
    return this.converter_;
  }

  /** Converts a macro. */
  public convertMacro(input: string): string {
    let result = this.macroConverter_?.(input);
    return result ?? input;
  }

  private addUserPhraseConverter?: (input: string) => string | undefined;
  private excludedPhraseConverter?: (input: string) => string | undefined;

  /** Sets the string converter. */
  public setAddUserPhraseConverter(
    converter?: (input: string) => string | undefined
  ): void {
    this.addUserPhraseConverter = converter;
  }

  public getAddUserPhraseConverter():
    | ((input: string) => string | undefined)
    | undefined {
    return this.addUserPhraseConverter;
  }

  /** Sets the string converter. */
  public setExcludedPhraseConverter(
    converter?: (input: string) => string | undefined
  ): void {
    this.excludedPhraseConverter = converter;
  }

  public getExcludedPhraseConverter():
    | ((input: string) => string | undefined)
    | undefined {
    return this.excludedPhraseConverter;
  }

  private convertTextToMap(input: String): Map<string, string[]> {
    let map: Map<string, string[]> = new Map();
    const lines = input.split("\n");
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith("#") || line.length === 0) {
        continue; // skip comments and empty lines
      }
      const parts = line.split(" ");
      if (parts.length < 2) {
        continue;
      }
      const key = parts[1];
      let value = parts[0];
      let list = map.get(key);
      if (list != undefined) {
        list.push(value);
        map.set(key, list);
      } else {
        list = [];
        list.push(value);
        map.set(key, list);
      }
    }
    return map;
  }

  /** Sets the user phrases. */
  public setUserPhrases(input: Map<string, string[]> | string): void {
    let map: Map<string, string[]> | undefined = undefined;
    if (typeof input === "string") {
      map = this.convertTextToMap(input);
    } else {
      map = input;
    }
    this.userPhrases_.setUserPhrases(map);
  }

  public getUserPhrases(): Map<string, string[]> {
    return this.userPhrases_["userPhrases_"];
  }

  /** Sets the excluded phrases. */
  public setExcludedPhrases(input: Map<string, string[]> | string): void {
    let map: Map<string, string[]> | undefined = undefined;
    if (typeof input === "string") {
      map = this.convertTextToMap(input);
    } else {
      map = input;
    }
    this.excludedPhrases_.setUserPhrases(map);
  }

  public getExcludedPhrases(): Map<string, string[]> {
    return this.excludedPhrases_["userPhrases_"];
  }

  /**
   * Sets a callback function to be invoked whenever the user phrases change.
   *
   * @param callback - A function that receives a Map of phrases. The Map
   * contains string keys mapped to arrays of strings (representing the
   * phrases).
   * @returns void
   */
  public setOnPhraseChange(
    callback: (map: Map<string, string[]>) => void
  ): void {
    this.userPhrases_.setOnPhraseChange(callback);
  }

  /**
   * Sets a callback to be invoked when the excluded phrases collection changes.
   *
   * @param callback A function that will be called when the excluded phrases
   * change. The function receives a Map where keys are phrases and values are
   * arrays of strings representing the excluded phrases.
   */
  public setOnExcludedPhraseChange(
    callback: (map: Map<string, string[]>) => void
  ): void {
    this.excludedPhrases_.setOnPhraseChange(callback);
  }

  /**
   * Adds user phrases.
   * @param key The key.
   * @param phrase The phrase.
   */
  addUserPhrase(key: string, phrase: string): void {
    if (this.addUserPhraseConverter != undefined) {
      phrase = this.addUserPhraseConverter(phrase) ?? phrase;
    }
    this.excludedPhrases_.removeUserPhrase(key, phrase);
    this.userPhrases_.addUserPhrase(key, phrase);
  }

  addExcludedPhrase(key: string, phrase: string): void {
    if (this.excludedPhraseConverter != undefined) {
      phrase = this.excludedPhraseConverter(phrase) ?? phrase;
    }
    this.userPhrases_.removeUserPhrase(key, phrase);
    this.excludedPhrases_.addUserPhrase(key, phrase);
  }

  constructor(map: any) {
    this.map_ = map;
  }

  getUnigrams(key: string): Unigram[] {
    if (key === " ") {
      const space = new Unigram(" ");
      return [space];
    }

    let allUnigrams: Unigram[] = [];
    let userUnigrams: Unigram[] = [];
    const excludedValues: Set<string> = new Set();
    const insertedValues: Set<string> = new Set();

    if (this.excludedPhrases_.hasUnigrams(key)) {
      const excludedUnigrams = this.excludedPhrases_.getUnigrams(key);
      for (let u of excludedUnigrams) {
        excludedValues.add(u.value);
      }
    }

    if (this.userPhrases_.hasUnigrams(key)) {
      const rawUserUnigrams = this.userPhrases_.getUnigrams(key);
      userUnigrams = this.filterAndTransformUnigrams(
        rawUserUnigrams,
        excludedValues,
        insertedValues
      );
    }

    let actualKey = WebLanguageModel.maybeAbsoluteOrderKey(key);
    if (actualKey in this.map_) {
      let values = this.map_[actualKey].split(" ");
      const rawGlobalUnigrams: Unigram[] = [];
      for (let i = 0; i < values.length; i += 2) {
        let value = values[i];
        let score = parseFloat(values[i + 1]);
        const unigram = new Unigram(value, score);
        rawGlobalUnigrams.push(unigram);
      }
      allUnigrams = this.filterAndTransformUnigrams(
        rawGlobalUnigrams,
        excludedValues,
        insertedValues
      );
    }

    // This relies on the fact that we always use the default separator.
    const isKeyMultiSyllable = key.includes("-");

    // If key is multi-syllabic (for example, ㄉㄨㄥˋ-ㄈㄢˋ), we just
    // insert all collected userUnigrams on top of the unigrams fetched from
    // the database. If key is mono-syllabic (for example, ㄉㄨㄥˋ), then
    // we'll have to rewrite the collected userUnigrams.
    //
    // This is because, by default, user unigrams have a score of 0, which
    // guarantees that grid walks will choose them. This is problematic,
    // however, when a single-syllabic user phrase is competing with other
    // multisyllabic phrases that start with the same syllable. For example,
    // if a user has 丼 for ㄉㄨㄥˋ, and because that unigram has a score
    // of 0, no other phrases in the database that start with ㄉㄨㄥˋ would
    // be able to compete with it. Without the rewrite, ㄉㄨㄥˋ-ㄗㄨㄛˋ
    // would always result in "丼" + "作" instead of "動作" because the
    // node for "丼" would dominate the walk.
    if (isKeyMultiSyllable || allUnigrams.length === 0) {
      allUnigrams = userUnigrams.concat(allUnigrams);
    } else if (userUnigrams.length !== 0) {
      // Find the highest score from the existing allUnigrams.
      let topScore = Number.MIN_SAFE_INTEGER;
      for (let unigram of allUnigrams) {
        if (unigram.score > topScore) {
          topScore = unigram.score;
        }
      }

      // Boost by a very small number. This is the score for user phrases.
      const epsilon = 0.000000001;
      const boostedScore = topScore + epsilon;
      const rewrittenUserUnigrams: Unigram[] = [];
      for (let unigram of userUnigrams) {
        rewrittenUserUnigrams.push(new Unigram(unigram.value, boostedScore));
      }
      allUnigrams = rewrittenUserUnigrams.concat(allUnigrams);
    }
    return allUnigrams;
  }

  hasUnigrams(key: string): boolean {
    if (key === " ") {
      return true;
    }

    let result = this.userPhrases_.hasUnigrams(key);
    if (result) {
      return true;
    }
    return WebLanguageModel.maybeAbsoluteOrderKey(key) in this.map_;
  }

  filterAndTransformUnigrams(
    unigrams: Unigram[],
    excludedValues: Set<string>,
    insertedValues: Set<string>
  ) {
    const results: Unigram[] = [];

    for (let unigram of unigrams) {
      const originalValue = unigram.value;
      if (excludedValues.has(originalValue)) {
        continue;
      }

      let value = originalValue;
      if (this.macroConverter_) {
        let replacement = this.macroConverter_(value);
        if (replacement !== undefined) {
          value = replacement;
        }
      }
      if (this.converter_) {
        let replacement = this.converter_(value);
        if (replacement !== undefined) {
          value = replacement;
        }
      }
      if (!value) {
        continue;
      }
      if (!insertedValues.has(value)) {
        results.push(new Unigram(value, unigram.score));
        insertedValues.add(value);
      }
    }
    return results;
  }

  /**
   * Converts to an absolute-order key if needed.
   *
   * @param key a key that KeyHandler uses
   * @returns an absolute-order key if it's not a punctuation key.
   */
  static maybeAbsoluteOrderKey(key: string): string {
    // We have some keys like "_punctuation_Hsu_-" so we can't simply split by
    // the hyphen. Replace this an implausible string before we split.
    const r = key.replace(/_-/g, "_______");

    const elements = r
      .split("-")
      .map((s) =>
        s.startsWith("_")
          ? s
          : BopomofoSyllable.FromComposedString(s).absoluteOrderString
      );

    let actualKey = elements.join("").replace(/_______/g, "_-");
    return actualKey;
  }

  private reverseMap_: Map<string, [string, number][]> | undefined = undefined;

  getReading(input: string): string | undefined {
    let result: string | undefined = undefined;
    let topScore = -8;

    if (this.reverseMap_ === undefined) {
      this.reverseMap_ = new Map();
      for (let key in this.map_) {
        let values = this.map_[key].split(" ");
        for (let i = 0; i < values.length; i += 2) {
          let value = values[i];
          let score = parseFloat(values[i + 1]);
          // Also add to reverse map.
          let list = this.reverseMap_.get(value);
          if (list === undefined) {
            list = [];
          }
          list.push([key, score]);
          this.reverseMap_.set(value, list);

          if (value === input) {
            if (score > topScore) {
              result = key;
              topScore = score;
            }
          }
        }
      }
    } else {
      let list = this.reverseMap_.get(input);
      if (list === undefined) {
        return undefined;
      }
      for (let item of list) {
        if (item[1] > topScore) {
          result = item[0];
          topScore = item[1];
        }
      }
    }

    if (result === undefined) {
      return undefined;
    }

    if (
      result.startsWith("_") &&
      result.charAt(result.length - 2) === "_" &&
      (result.includes("punctuation") ||
        result.includes("letter") ||
        result.includes("number") ||
        result.includes("numpad"))
    ) {
      // this is a punctuation
      return result;
    }

    const readings: string[] = [];
    for (let i = 0; i < result.length; i += 2) {
      const substring = result.substring(i, i + 2);
      const bopomofoSyllable =
        BopomofoSyllable.FromAbsoluteOrderString(substring);
      readings.push(bopomofoSyllable.composedString);
    }
    return readings.join("-");
  }
}
