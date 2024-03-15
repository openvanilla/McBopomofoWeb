import { BopomofoBrailleSyllable } from "./BopomofoBraille";
import { Punctuation } from "./Punctuation";

export class BopomofoBrailleConverter {
  static convertBpmfToBraille(bopomofo: string): string {
    let output = "";
    let readHead = 0;
    let length = bopomofo.length;

    while (readHead < length) {
      let target = Math.min(4, length - readHead);
      let found = false;
      for (let i = target; i >= 0; i--) {
        let start = readHead;
        let end = readHead + i;
        let substring = bopomofo.substring(start, end);
        try {
          let b = BopomofoBrailleSyllable.fromBpmf(substring);
          output += b.braille;
          readHead = end;
          found = true;
          break;
        } catch (e) {
          // pass
        }
      }
      if (!found) {
        let substring = bopomofo.substring(readHead, readHead + 1);
        let punctuation = Punctuation.fromBpmf(substring);
        if (punctuation != undefined) {
          output += Punctuation.toBraille(punctuation);
          readHead += 1;
          found = true;
        }
      }
      if (!found) {
        let substring = bopomofo.substring(readHead, readHead + 1);
        output += substring;
        readHead += 1;
      }
    }
    return output;
  }

  static convertBrailleToBpmf(braille: string): string {
    let output = "";
    let readHead = 0;
    let length = braille.length;
    while (readHead < length) {
      let target = Math.min(3, length - readHead);
      let found = false;
      if (target > 0) {
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          try {
            let b = BopomofoBrailleSyllable.fromBraille(substring);
            if (b != undefined) {
              output += b.bpmf;
              readHead = end;
              found = true;
              break;
            }
          } catch (e) {
            // pass
          }
        }
      }
      if (!found) {
        target = Math.min(4, length - readHead);
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          let punctuation = Punctuation.fromBraille(substring);
          if (punctuation != undefined) {
            output += Punctuation.toBpmf(punctuation);
            readHead = end;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        let substring = braille.substring(readHead, readHead + 1);
        output += substring;
        readHead += 1;
      }
    }

    return output;
  }

  static convertBrailleToTokens(
    braille: string
  ): (BopomofoBrailleSyllable | string)[] {
    var output: any[] = [];
    let text = "";
    let readHead = 0;
    let length = braille.length;
    while (readHead < length) {
      let target = Math.min(3, length - readHead);
      let found = false;
      if (target > 0) {
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          try {
            let b = BopomofoBrailleSyllable.fromBraille(substring);
            if (b != undefined) {
              if (text.length > 0) {
                output.push(text);
                text = "";
              }
              output.push(b);
              readHead = end;
              found = true;
              break;
            }
          } catch (e) {
            // pass
          }
        }
      }
      if (!found) {
        target = Math.min(4, length - readHead);
        for (let i = target; i >= 1; i--) {
          let start = readHead;
          let end = readHead + i;
          let substring = braille.substring(start, end);
          let punctuation = Punctuation.fromBraille(substring);
          if (punctuation != undefined) {
            text += Punctuation.toBpmf(punctuation);
            readHead = end;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        let substring = braille.substring(readHead, readHead + 1);
        text += substring;
        readHead += 1;
      }
    }

    if (text.length > 0) {
      output.push(text);
      text = "";
    }

    return output;
  }
}
