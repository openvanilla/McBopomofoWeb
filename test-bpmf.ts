import { KeyHandler } from "./src/McBopomofo/KeyHandler";
import { WebLanguageModel } from "./src/McBopomofo/WebLanguageModel";
import { webData } from "./src/McBopomofo/WebData";
import { Inputting } from "./src/McBopomofo/InputState";
import { Key } from "./src/McBopomofo/Key";

const lm = new WebLanguageModel(webData);
const keyHandler = new KeyHandler(lm);

function asciiKey(input: string[]): Key[] {
  return input.map(s => Key.asciiKey(s));
}

let keys = asciiKey(["c", "j", "0", "6"]); // ㄏㄨㄢˊ
let state: any;
for (const key of keys) {
  keyHandler.handle(key, state || new (require("./src/McBopomofo/InputState").Empty)(), (s) => (state = s), () => {});
}

console.log("Without annotation: " + state.tooltip + " / " + state.composingBuffer);

keyHandler.bopomofoFontAnnotationSupportEnabled = true;
let state2: any;
for (const key of keys) {
  keyHandler.handle(key, state2 || new (require("./src/McBopomofo/InputState").Empty)(), (s) => (state2 = s), () => {});
}

console.log("With annotation: " + state2.tooltip + " / " + state2.composingBuffer);

