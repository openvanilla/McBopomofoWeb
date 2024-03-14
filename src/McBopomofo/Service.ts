import { webData } from "./WebData";
import { WebLanguageModel } from "./WebLanguageModel";

const ChineseConvert = require("chinese_convert");

export class Service {
  private lm_: WebLanguageModel;

  constructor() {
    this.lm_ = new WebLanguageModel(webData);
  }

  public convertTextToBraille(input: string): string {
    var output: string = "";
    var converted = ChineseConvert.cn2tw(input);
    var length = converted.length;
    return output;
  }
}
