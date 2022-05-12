import { Bigram, KeyValuePair, LanguageModel, Unigram } from "../Gramambular";

export class WebLanguageModel implements LanguageModel {
  private map_: Map<string, [string, number][]>;

  constructor(map: Map<string, [string, number][]>) {
    this.map_ = map;
  }

  bigramsForKey(preceedingKey: string, key: string): Bigram[] {
    return [];
  }

  unigramsForKey(key: string): Unigram[] {
    // console.log(key);
    let list = this.map_.get(key);
    // console.log(list);
    if (list === undefined) return [];
    let result: Unigram[] = [];
    for (let item of list) {
      let g = new Unigram(new KeyValuePair(key, item[0]), item[1]);
      result.push(g);
    }
    return result;
  }

  hasUnigramsForKey(key: string): boolean {
    let list = this.map_.get(key);
    if (list === undefined) return false;
    return list.length > 0;
  }
}
