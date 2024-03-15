import {
  BopomofoBrailleConverter,
  BopomofoBrailleSyllable,
} from "../BopomofoBraille";
import { ReadingGrid } from "../Gramambular2";
import { webData } from "./WebData";
import { WebLanguageModel } from "./WebLanguageModel";

const ChineseConvert = require("chinese_convert");

export class Service {
  private lm_: WebLanguageModel;
  private grid_: ReadingGrid;

  constructor() {
    this.lm_ = new WebLanguageModel(webData);
    this.grid_ = new ReadingGrid(this.lm_);
  }

  public convertBrailleToText(input: string): string {
    let output: string = "";
    let tokens = BopomofoBrailleConverter.convertBrailleToTokens(input);
    for (let token of tokens) {
      if (token instanceof BopomofoBrailleSyllable) {
        this.grid_.insertReading(token.bpmf);
      } else {
        let result = this.grid_.walk();
        for (let node of result.nodes) {
          output += node.value;
        }
        this.grid_.clear();
        output += token;
      }
    }

    let result = this.grid_.walk();
    for (let node of result.nodes) {
      output += node.value;
    }
    this.grid_.clear();
    return output;
  }

  public convertTextToBraille(input: string): string {
    let output: string = "";
    let converted = ChineseConvert.cn2tw(input);
    let length = converted.length;
    let readHead = 0;
    let debug = "";
    while (readHead < length) {
      let targetLength = Math.min(6, length - readHead);
      let found = false;
      for (let i = targetLength; i > 0; i--) {
        let end = readHead + i;
        let subString = converted.substring(readHead, end);
        let reading = this.lm_.getReading(subString);
        if (reading != undefined) {
          debug += reading;
          let components = reading.split("-");
          for (let component of components) {
            output += BopomofoBrailleConverter.convertBpmfToBraille(component);
          }
          readHead = end;
          found = true;
          break;
        }
      }

      if (!found) {
        output += converted.charAt(readHead);
        readHead += 1;
      }
    }
    return output;
  }
}
