import { KeyValuePair, LanguageModel, Unigram } from "../Gramambular";

export class WebLanguageModel implements LanguageModel {
  private map_: Map<string, [string, number][]>;

  constructor(map: Map<string, [string, number][]>) {
    this.map_ = map;
  }

  unigramsForKey(key: string): Unigram[] {
    if (key === " ") {
      let space = new Unigram(new KeyValuePair(" ", " "));
      return [space];
    }

    let list = this.map_.get(key);
    if (list === undefined) return [];
    let result: Unigram[] = [];
    for (let item of list) {
      let g = new Unigram(new KeyValuePair(key, item[0]), item[1]);
      result.push(g);
    }
    return result;
  }

  hasUnigramsForKey(key: string): boolean {
    if (key === " ") {
      return true;
    }

    let list = this.map_.get(key);
    if (list === undefined) return false;
    return list.length > 0;
  }
}
