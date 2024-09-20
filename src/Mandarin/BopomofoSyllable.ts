/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BopomofoCharacterMap } from "./BopomofoCharacterMap";

export type Component = number;

class PinyinWrapper {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
  substring(arg: number): PinyinWrapper {
    return new PinyinWrapper(this.text.substring(arg));
  }
}

class PinyinParseHelper {
  static ConsumePrefix(wrapper: PinyinWrapper, prefix: string) {
    let target = wrapper.text;
    if (target.length < prefix.length) {
      return false;
    }
    if (target.substr(0, prefix.length) === prefix) {
      target = target.substr(prefix.length, target.length - prefix.length);
      wrapper.text = target;
      return true;
    }
    return false;
  }
}

/** Represents the Bopomofo syllables. */
export class BopomofoSyllable {
  private syllable_: Component;

  constructor(syllable: Component = 0) {
    this.syllable_ = syllable;
  }

  static FromHanyuPinyin(str: string): BopomofoSyllable {
    if (str.length === 0) {
      return new BopomofoSyllable();
    }
    let pinyin: PinyinWrapper = new PinyinWrapper(str.toLocaleLowerCase());
    let firstComponent: Component = 0;
    let secondComponent: Component = 0;
    let thirdComponent: Component = 0;
    let toneComponent: Component = 0;

    let independentConsonant = false;

    // the y exceptions fist
    if (0) {
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "yuan")) {
      secondComponent = BopomofoSyllable.UE;
      thirdComponent = BopomofoSyllable.AN;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ying")) {
      secondComponent = BopomofoSyllable.I;
      thirdComponent = BopomofoSyllable.ENG;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "yung")) {
      secondComponent = BopomofoSyllable.UE;
      thirdComponent = BopomofoSyllable.ENG;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "yong")) {
      secondComponent = BopomofoSyllable.UE;
      thirdComponent = BopomofoSyllable.ENG;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "yue")) {
      secondComponent = BopomofoSyllable.UE;
      thirdComponent = BopomofoSyllable.E;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "yun")) {
      secondComponent = BopomofoSyllable.UE;
      thirdComponent = BopomofoSyllable.EN;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "you")) {
      secondComponent = BopomofoSyllable.I;
      thirdComponent = BopomofoSyllable.OU;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "yu")) {
      secondComponent = BopomofoSyllable.UE;
    }

    // try the first character
    let c: string = pinyin.text.length > 0 ? pinyin.text.charAt(0) : "";
    switch (c) {
      case "b":
        firstComponent = BopomofoSyllable.B;
        pinyin = pinyin.substring(1);
        break;
      case "p":
        firstComponent = BopomofoSyllable.P;
        pinyin = pinyin.substring(1);
        break;
      case "m":
        firstComponent = BopomofoSyllable.M;
        pinyin = pinyin.substring(1);
        break;
      case "f":
        firstComponent = BopomofoSyllable.F;
        pinyin = pinyin.substring(1);
        break;
      case "d":
        firstComponent = BopomofoSyllable.D;
        pinyin = pinyin.substring(1);
        break;
      case "t":
        firstComponent = BopomofoSyllable.T;
        pinyin = pinyin.substring(1);
        break;
      case "n":
        firstComponent = BopomofoSyllable.N;
        pinyin = pinyin.substring(1);
        break;
      case "l":
        firstComponent = BopomofoSyllable.L;
        pinyin = pinyin.substring(1);
        break;
      case "g":
        firstComponent = BopomofoSyllable.G;
        pinyin = pinyin.substring(1);
        break;
      case "k":
        firstComponent = BopomofoSyllable.K;
        pinyin = pinyin.substring(1);
        break;
      case "h":
        firstComponent = BopomofoSyllable.H;
        pinyin = pinyin.substring(1);
        break;
      case "j":
        firstComponent = BopomofoSyllable.J;
        pinyin = pinyin.substring(1);
        break;
      case "q":
        firstComponent = BopomofoSyllable.Q;
        pinyin = pinyin.substring(1);
        break;
      case "x":
        firstComponent = BopomofoSyllable.X;
        pinyin = pinyin.substring(1);
        break;

      // special handling for w and y
      case "w":
        secondComponent = BopomofoSyllable.U;
        pinyin = pinyin.substring(1);
        break;
      case "y":
        if (!secondComponent && !thirdComponent) {
          secondComponent = BopomofoSyllable.I;
        }
        pinyin = pinyin.substring(1);
        break;
    }

    // then we try ZH, CH, SH, R, Z, C, S (in that order)
    if (0) {
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "zh")) {
      firstComponent = BopomofoSyllable.ZH;
      independentConsonant = true;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ch")) {
      firstComponent = BopomofoSyllable.CH;
      independentConsonant = true;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "sh")) {
      firstComponent = BopomofoSyllable.SH;
      independentConsonant = true;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "r")) {
      firstComponent = BopomofoSyllable.R;
      independentConsonant = true;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "z")) {
      firstComponent = BopomofoSyllable.Z;
      independentConsonant = true;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "c")) {
      firstComponent = BopomofoSyllable.C;
      independentConsonant = true;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "s")) {
      firstComponent = BopomofoSyllable.S;
      independentConsonant = true;
    }

    // consume exceptions first: (ien, in), (iou, iu), (uen, un), (veng, iong),
    // (ven, vn), (uei, ui), ung but longer sequence takes precedence
    if (0) {
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "veng")) {
      secondComponent = BopomofoSyllable.UE;
      thirdComponent = BopomofoSyllable.ENG;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "iong")) {
      secondComponent = BopomofoSyllable.UE;
      thirdComponent = BopomofoSyllable.ENG;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ing")) {
      secondComponent = BopomofoSyllable.I;
      thirdComponent = BopomofoSyllable.ENG;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ien")) {
      secondComponent = BopomofoSyllable.I;
      thirdComponent = BopomofoSyllable.EN;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "iou")) {
      secondComponent = BopomofoSyllable.I;
      thirdComponent = BopomofoSyllable.OU;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "uen")) {
      secondComponent = BopomofoSyllable.U;
      thirdComponent = BopomofoSyllable.EN;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ven")) {
      secondComponent = BopomofoSyllable.UE;
      thirdComponent = BopomofoSyllable.EN;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "uei")) {
      secondComponent = BopomofoSyllable.U;
      thirdComponent = BopomofoSyllable.EI;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ung")) {
      // f exception
      if (firstComponent === BopomofoSyllable.F) {
        thirdComponent = BopomofoSyllable.ENG;
      } else {
        secondComponent = BopomofoSyllable.U;
        thirdComponent = BopomofoSyllable.ENG;
      }
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ong")) {
      // f exception
      if (firstComponent === BopomofoSyllable.F) {
        thirdComponent = BopomofoSyllable.ENG;
      } else {
        secondComponent = BopomofoSyllable.U;
        thirdComponent = BopomofoSyllable.ENG;
      }
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "un")) {
      if (
        firstComponent === BopomofoSyllable.J ||
        firstComponent === BopomofoSyllable.Q ||
        firstComponent === BopomofoSyllable.X
      ) {
        secondComponent = BopomofoSyllable.UE;
      } else {
        secondComponent = BopomofoSyllable.U;
      }
      thirdComponent = BopomofoSyllable.EN;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "iu")) {
      secondComponent = BopomofoSyllable.I;
      thirdComponent = BopomofoSyllable.OU;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "in")) {
      secondComponent = BopomofoSyllable.I;
      thirdComponent = BopomofoSyllable.EN;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "vn")) {
      secondComponent = BopomofoSyllable.UE;
      thirdComponent = BopomofoSyllable.EN;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ui")) {
      secondComponent = BopomofoSyllable.U;
      thirdComponent = BopomofoSyllable.EI;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ue")) {
      secondComponent = BopomofoSyllable.UE;
      thirdComponent = BopomofoSyllable.E;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ü")) {
      secondComponent = BopomofoSyllable.UE;
    }

    // then consume the middle component...
    if (0) {
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "i")) {
      secondComponent = independentConsonant ? 0 : BopomofoSyllable.I;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "u")) {
      if (
        firstComponent === BopomofoSyllable.J ||
        firstComponent === BopomofoSyllable.Q ||
        firstComponent === BopomofoSyllable.X
      ) {
        secondComponent = BopomofoSyllable.UE;
      } else {
        secondComponent = BopomofoSyllable.U;
      }
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "v")) {
      secondComponent = BopomofoSyllable.UE;
    }

    // the vowels, longer sequence takes precedence
    if (0) {
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ang")) {
      thirdComponent = BopomofoSyllable.ANG;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "eng")) {
      thirdComponent = BopomofoSyllable.ENG;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "err")) {
      thirdComponent = BopomofoSyllable.ERR;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ai")) {
      thirdComponent = BopomofoSyllable.AI;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ei")) {
      thirdComponent = BopomofoSyllable.EI;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ao")) {
      thirdComponent = BopomofoSyllable.AO;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "ou")) {
      thirdComponent = BopomofoSyllable.OU;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "an")) {
      thirdComponent = BopomofoSyllable.AN;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "en")) {
      thirdComponent = BopomofoSyllable.EN;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "er")) {
      thirdComponent = BopomofoSyllable.ERR;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "a")) {
      thirdComponent = BopomofoSyllable.A;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "o")) {
      thirdComponent = BopomofoSyllable.O;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "e")) {
      if (secondComponent) {
        thirdComponent = BopomofoSyllable.E;
      } else {
        thirdComponent = BopomofoSyllable.ER;
      }
    }

    // at last!
    if (0) {
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "1")) {
      toneComponent = BopomofoSyllable.Tone1;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "2")) {
      toneComponent = BopomofoSyllable.Tone2;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "3")) {
      toneComponent = BopomofoSyllable.Tone3;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "4")) {
      toneComponent = BopomofoSyllable.Tone4;
    } else if (PinyinParseHelper.ConsumePrefix(pinyin, "5")) {
      toneComponent = BopomofoSyllable.Tone5;
    }

    return new BopomofoSyllable(
      firstComponent | secondComponent | thirdComponent | toneComponent
    );
  }

  HanyuPinyinString(includesTone: boolean, useVForUUmlaut: boolean): string {
    let consonant = "";
    let middle = "";
    let vowel = "";
    let tone = "";

    let cc = this.consonantComponent;
    let mvc = this.middleVowelComponent;
    let vc = this.vowelComponent;
    let hasNoMVCOrVC = !(mvc || vc);

    switch (cc) {
      case BopomofoSyllable.B:
        consonant = "b";
        break;
      case BopomofoSyllable.P:
        consonant = "p";
        break;
      case BopomofoSyllable.M:
        consonant = "m";
        break;
      case BopomofoSyllable.F:
        consonant = "f";
        break;
      case BopomofoSyllable.D:
        consonant = "d";
        break;
      case BopomofoSyllable.T:
        consonant = "t";
        break;
      case BopomofoSyllable.N:
        consonant = "n";
        break;
      case BopomofoSyllable.L:
        consonant = "l";
        break;
      case BopomofoSyllable.G:
        consonant = "g";
        break;
      case BopomofoSyllable.K:
        consonant = "k";
        break;
      case BopomofoSyllable.H:
        consonant = "h";
        break;
      case BopomofoSyllable.J:
        consonant = "j";
        if (hasNoMVCOrVC) middle = "i";
        break;
      case BopomofoSyllable.Q:
        consonant = "q";
        if (hasNoMVCOrVC) middle = "i";
        break;
      case BopomofoSyllable.X:
        consonant = "x";
        if (hasNoMVCOrVC) middle = "i";
        break;
      case BopomofoSyllable.ZH:
        consonant = "zh";
        if (hasNoMVCOrVC) middle = "i";
        break;
      case BopomofoSyllable.CH:
        consonant = "ch";
        if (hasNoMVCOrVC) middle = "i";
        break;
      case BopomofoSyllable.SH:
        consonant = "sh";
        if (hasNoMVCOrVC) middle = "i";
        break;
      case BopomofoSyllable.R:
        consonant = "r";
        if (hasNoMVCOrVC) middle = "i";
        break;
      case BopomofoSyllable.Z:
        consonant = "z";
        if (hasNoMVCOrVC) middle = "i";
        break;
      case BopomofoSyllable.C:
        consonant = "c";
        if (hasNoMVCOrVC) middle = "i";
        break;
      case BopomofoSyllable.S:
        consonant = "s";
        if (hasNoMVCOrVC) middle = "i";
        break;
    }

    switch (mvc) {
      case BopomofoSyllable.I:
        if (!cc) {
          consonant = "y";
        }

        middle = !vc || cc ? "i" : "";
        break;
      case BopomofoSyllable.U:
        if (!cc) {
          consonant = "w";
        }
        middle = !vc || cc ? "u" : "";
        break;
      case BopomofoSyllable.UE:
        if (!cc) {
          consonant = "y";
        }

        if (
          (cc === BopomofoSyllable.N || cc === BopomofoSyllable.L) &&
          vc != BopomofoSyllable.E
        ) {
          middle = useVForUUmlaut ? "v" : "ü";
        } else {
          middle = "u";
        }

        break;
    }

    switch (vc) {
      case BopomofoSyllable.A:
        vowel = "a";
        break;
      case BopomofoSyllable.O:
        vowel = "o";
        break;
      case BopomofoSyllable.ER:
        vowel = "e";
        break;
      case BopomofoSyllable.E:
        vowel = "e";
        break;
      case BopomofoSyllable.AI:
        vowel = "ai";
        break;
      case BopomofoSyllable.EI:
        vowel = "ei";
        break;
      case BopomofoSyllable.AO:
        vowel = "ao";
        break;
      case BopomofoSyllable.OU:
        vowel = "ou";
        break;
      case BopomofoSyllable.AN:
        vowel = "an";
        break;
      case BopomofoSyllable.EN:
        vowel = "en";
        break;
      case BopomofoSyllable.ANG:
        vowel = "ang";
        break;
      case BopomofoSyllable.ENG:
        vowel = "eng";
        break;
      case BopomofoSyllable.ERR:
        vowel = "er";
        break;
    }

    // combination rules

    // ueng -> ong, but note "weng"
    if (
      (mvc === BopomofoSyllable.U || mvc === BopomofoSyllable.UE) &&
      vc === BopomofoSyllable.ENG
    ) {
      middle = "";
      vowel =
        cc === BopomofoSyllable.J ||
        cc === BopomofoSyllable.Q ||
        cc === BopomofoSyllable.X
          ? "iong"
          : !cc && mvc === BopomofoSyllable.U
          ? "eng"
          : "ong";
    }

    // ien, uen, üen -> in, un, ün ; but note "wen", "yin" and "yun"
    if (mvc && vc === BopomofoSyllable.EN) {
      if (cc) {
        vowel = "n";
      } else {
        if (mvc === BopomofoSyllable.UE) {
          vowel = "n"; // yun
        } else if (mvc === BopomofoSyllable.U) {
          vowel = "en"; // wen
        } else {
          vowel = "in"; // yin
        }
      }
    }

    // iou -> iu
    if (cc && mvc === BopomofoSyllable.I && vc === BopomofoSyllable.OU) {
      middle = "";
      vowel = "iu";
    }

    // ieng -> ing
    if (mvc === BopomofoSyllable.I && vc === BopomofoSyllable.ENG) {
      middle = "";
      vowel = "ing";
    }

    // uei -> ui
    if (cc && mvc === BopomofoSyllable.U && vc === BopomofoSyllable.EI) {
      middle = "";
      vowel = "ui";
    }

    if (includesTone) {
      switch (this.toneMarkerComponent) {
        case BopomofoSyllable.Tone2:
          tone = "2";
          break;
        case BopomofoSyllable.Tone3:
          tone = "3";
          break;
        case BopomofoSyllable.Tone4:
          tone = "4";
          break;
        case BopomofoSyllable.Tone5:
          tone = "5";
          break;
      }
    }

    return consonant + middle + vowel + tone;
  }

  static FromComposedString(str: string): BopomofoSyllable {
    let syllable = new BopomofoSyllable(0);
    for (let i = 0; i < str.length; i++) {
      let char = str.charAt(i);
      let component =
        BopomofoCharacterMap.sharedInstance.characterToComponent.get(char);
      if (component != undefined) {
        syllable.addEqual(new BopomofoSyllable(component));
      }
    }
    return syllable;
  }

  get composedString(): string {
    let str = "";
    function append(mask: Component, syllable: BopomofoSyllable) {
      if ((syllable.syllable_ & mask) != 0) {
        let char = BopomofoCharacterMap.sharedInstance.componentToCharacter.get(
          syllable.syllable_ & mask
        );
        if (char != undefined) {
          str += char;
        }
      }
    }

    append(BopomofoSyllable.ConsonantMask, this);
    append(BopomofoSyllable.MiddleVowelMask, this);
    append(BopomofoSyllable.VowelMask, this);
    append(BopomofoSyllable.ToneMarkerMask, this);
    return str;
  }

  static FromAbsoluteOrder(order: number): BopomofoSyllable {
    let copy = order;
    let consonantMask = copy % 22;
    copy -= consonantMask;
    let middleVowelMask = (copy % (22 * 4)) / 22;
    copy -= middleVowelMask * 22;
    let vowelMask = (copy % (22 * 4 * 14)) / (22 * 4);
    copy -= vowelMask * 22 * 4;
    let ToneMarkerMask = copy / (22 * 4 * 14);
    middleVowelMask = middleVowelMask << 5;
    vowelMask = vowelMask << 7;
    ToneMarkerMask = ToneMarkerMask << 11;

    return new BopomofoSyllable(
      consonantMask | middleVowelMask | vowelMask | ToneMarkerMask
    );
  }

  get absoluteOrder(): number {
    // turn BPMF syllable into a 4*14*4*22 number
    return (
      (this.syllable_ & BopomofoSyllable.ConsonantMask) +
      ((this.syllable_ & BopomofoSyllable.MiddleVowelMask) >> 5) * 22 +
      ((this.syllable_ & BopomofoSyllable.VowelMask) >> 7) * 22 * 4 +
      ((this.syllable_ & BopomofoSyllable.ToneMarkerMask) >> 11) * 22 * 4 * 14
    );
  }

  static FromAbsoluteOrderString(orderString: string) {
    let lowCode = orderString.charCodeAt(0);
    let highCode = orderString.charCodeAt(1);
    let low = lowCode - 48;
    let High = (highCode - 48) * 79;
    return BopomofoSyllable.FromAbsoluteOrder(low + High);
  }

  get absoluteOrderString(): string {
    // 5*14*4*22 = 6160, we use a 79*79 encoding to represent that
    let order = this.absoluteOrder;
    let low = 48 + (order % 79);
    let high = 48 + ((order / 79) & 127);
    return String.fromCharCode(low, high);
  }

  clear(): void {
    this.syllable_ = 0;
  }

  get isEmpty(): boolean {
    return this.syllable_ === 0;
  }

  get hasConsonant(): boolean {
    return !!(this.syllable_ & BopomofoSyllable.ConsonantMask);
  }

  get hasMiddleVowel(): boolean {
    return !!(this.syllable_ & BopomofoSyllable.MiddleVowelMask);
  }
  get hasVowel(): boolean {
    return !!(this.syllable_ & BopomofoSyllable.VowelMask);
  }

  get hasToneMarker(): boolean {
    return !!(this.syllable_ & BopomofoSyllable.ToneMarkerMask);
  }

  get consonantComponent(): Component {
    return this.syllable_ & BopomofoSyllable.ConsonantMask;
  }

  get middleVowelComponent(): Component {
    return this.syllable_ & BopomofoSyllable.MiddleVowelMask;
  }

  get vowelComponent(): Component {
    return this.syllable_ & BopomofoSyllable.VowelMask;
  }

  get toneMarkerComponent(): Component {
    return this.syllable_ & BopomofoSyllable.ToneMarkerMask;
  }

  isOverlappingWith(another: BopomofoSyllable): boolean {
    function IOW_SAND(mask: Component, syllable: BopomofoSyllable) {
      return (
        (syllable.syllable_ & mask) != 0 && (another.syllable_ & mask) != 0
      );
    }
    return (
      IOW_SAND(BopomofoSyllable.ConsonantMask, this) ||
      IOW_SAND(BopomofoSyllable.MiddleVowelMask, this) ||
      IOW_SAND(BopomofoSyllable.VowelMask, this) ||
      IOW_SAND(BopomofoSyllable.ToneMarkerMask, this)
    );
  }

  // consonants J, Q, X all require the existence of vowel I or UE
  get belongsToJQXClass(): boolean {
    let consonant = this.syllable_ & BopomofoSyllable.ConsonantMask;
    return (
      consonant === BopomofoSyllable.J ||
      consonant === BopomofoSyllable.Q ||
      consonant === BopomofoSyllable.X
    );
  }

  // zi, ci, si, chi, chi, shi, ri
  get belongsToZCSRClass(): boolean {
    let consonant = this.syllable_ & BopomofoSyllable.ConsonantMask;
    return consonant >= BopomofoSyllable.ZH && consonant <= BopomofoSyllable.S;
  }

  get maskType(): Component {
    let mask: Component = 0;
    mask |=
      this.syllable_ & BopomofoSyllable.ConsonantMask
        ? BopomofoSyllable.ConsonantMask
        : 0;
    mask |=
      this.syllable_ & BopomofoSyllable.MiddleVowelMask
        ? BopomofoSyllable.MiddleVowelMask
        : 0;
    mask |=
      this.syllable_ & BopomofoSyllable.VowelMask
        ? BopomofoSyllable.VowelMask
        : 0;
    mask |=
      this.syllable_ & BopomofoSyllable.ToneMarkerMask
        ? BopomofoSyllable.ToneMarkerMask
        : 0;
    return mask;
  }

  add(another: BopomofoSyllable): BopomofoSyllable {
    let newSyllable: Component = this.syllable_;
    function OP_SOVER(mask: Component) {
      if (another.syllable_ & mask) {
        newSyllable = (newSyllable & ~mask) | (another.syllable_ & mask);
      }
    }
    OP_SOVER(BopomofoSyllable.ConsonantMask);
    OP_SOVER(BopomofoSyllable.MiddleVowelMask);
    OP_SOVER(BopomofoSyllable.VowelMask);
    OP_SOVER(BopomofoSyllable.ToneMarkerMask);
    return new BopomofoSyllable(newSyllable);
  }

  addEqual(another: BopomofoSyllable): BopomofoSyllable {
    function OPE_SOVER(mask: Component, syllable: BopomofoSyllable) {
      if (another.syllable_ & mask) {
        syllable.syllable_ =
          (syllable.syllable_ & ~mask) | (another.syllable_ & mask);
      }
    }
    OPE_SOVER(BopomofoSyllable.ConsonantMask, this);
    OPE_SOVER(BopomofoSyllable.MiddleVowelMask, this);
    OPE_SOVER(BopomofoSyllable.VowelMask, this);
    OPE_SOVER(BopomofoSyllable.ToneMarkerMask, this);
    return this;
  }

  static ConsonantMask = 0x001f; // 0000 0000 0001 1111, 21 consonants
  static MiddleVowelMask = 0x0060; // 0000 0000 0110 0000, 3 middle vowels
  static VowelMask = 0x0780; // 0000 0111 1000 0000, 13 vowels
  static ToneMarkerMask = 0x3800; // 0011 1000 0000 0000, 5 tones (tone1 = 0x00)
  static B = 0x0001;
  static P = 0x0002;
  static M = 0x0003;
  static F = 0x0004;
  static D = 0x0005;
  static T = 0x0006;
  static N = 0x0007;
  static L = 0x0008;
  static G = 0x0009;
  static K = 0x000a;
  static H = 0x000b;
  static J = 0x000c;
  static Q = 0x000d;
  static X = 0x000e;
  static ZH = 0x000f;
  static CH = 0x0010;
  static SH = 0x0011;
  static R = 0x0012;
  static Z = 0x0013;
  static C = 0x0014;
  static S = 0x0015;
  static I = 0x0020;
  static U = 0x0040;
  static UE = 0x0060; // ue = u umlaut (we use the German convention here as an ersatz to the /ju:/ sound)
  static A = 0x0080;
  static O = 0x0100;
  static ER = 0x0180;
  static E = 0x0200;
  static AI = 0x0280;
  static EI = 0x0300;
  static AO = 0x0380;
  static OU = 0x0400;
  static AN = 0x0480;
  static EN = 0x0500;
  static ANG = 0x0580;
  static ENG = 0x0600;
  static ERR = 0x0680;
  static Tone1 = 0x0000;
  static Tone2 = 0x0800;
  static Tone3 = 0x1000;
  static Tone4 = 0x1800;
  static Tone5 = 0x2000;
}
