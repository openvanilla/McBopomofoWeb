import { KeyValuePair, LanguageModel, Unigram } from "../Gramambular";

/**
 * The model for user phrases.
 */
export class UserPhrases implements LanguageModel {
  private map_: Map<string, string[]> = new Map();
  private onPhraseChange: (map: Map<string, string[]>) => void = () => {};

  setUserPhrases(map: Map<string, string[]>): void {
    if (map === null || map === undefined) {
      return;
    }
    this.map_ = map;
  }

  setOnPhraseChange(callback: (map: Map<string, string[]>) => void): void {
    this.onPhraseChange = callback;
  }

  addUserPhrases(key: string, phrase: string): void {
    let list = this.map_.get(key);
    if (list != undefined) {
      if (list.includes(phrase)) {
        return;
      }
      list.push(phrase);
      this.map_.set(key, list);
    } else {
      list = [];
      list.push(phrase);
      this.map_.set(key, list);
    }
    this.onPhraseChange(this.map_);
  }

  unigramsForKey(key: string): Unigram[] {
    let result: Unigram[] = [];
    let list = this.map_.get(key);
    if (list != undefined) {
      for (let item of list) {
        let g = new Unigram(new KeyValuePair(key, item), 0);
        result.push(g);
      }
    }
    return result;
  }

  hasUnigramsForKey(key: string): boolean {
    let list = this.map_.get(key);
    if (list === undefined) return false;
    return list.length > 0;
  }
}

/**
 * The main language model.
 */
export class WebLanguageModel implements LanguageModel {
  private map_: Map<string, [string, number][]>;
  private userPhrases_: UserPhrases = new UserPhrases();
  public get userPhrases(): UserPhrases {
    return this.userPhrases_;
  }

  constructor(map: Map<string, [string, number][]>) {
    this.map_ = map;
  }

  unigramsForKey(key: string): Unigram[] {
    if (key === " ") {
      let space = new Unigram(new KeyValuePair(" ", " "));
      return [space];
    }

    let result: Unigram[] = [];
    let usedValues: string[] = [];
    let userPhrases = this.userPhrases.unigramsForKey(key);
    for (let phrase of userPhrases) {
      if (!usedValues.includes(phrase.keyValue.value)) {
        result.push(phrase);
      }
      usedValues.push(phrase.keyValue.value);
    }

    let list = this.map_.get(key);
    if (list != undefined) {
      for (let item of list) {
        if (!usedValues.includes(item[0])) {
          let g = new Unigram(new KeyValuePair(key, item[0]), item[1]);
          result.push(g);
        }
        usedValues.push(item[0]);
      }
    }
    return result;
  }

  hasUnigramsForKey(key: string): boolean {
    if (key === " ") {
      return true;
    }

    let result = this.userPhrases_.hasUnigramsForKey(key);
    if (result) {
      return true;
    }
    let list = this.map_.get(key);
    if (list === undefined) return false;
    return list.length > 0;
  }
}
