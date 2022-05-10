import { BopomofoSyllable, Component } from "./BopomofoSyllable";

export type BopomofoKeyToComponentMap = Map<string, Component[]>;
export type BopomofoComponentToKeyMap = Map<Comment, string>;

export class BopomofoKeyboardLayout {
  private static StandardLayout_: BopomofoKeyboardLayout =
    BopomofoKeyboardLayout.CreateStandardLayout_();

  static get StandardLayout(): BopomofoKeyboardLayout {
    return BopomofoKeyboardLayout.StandardLayout_;
  }

  private static IBMLayout_: BopomofoKeyboardLayout =
    BopomofoKeyboardLayout.CreateIBMLayout_();

  static get IBMLayout(): BopomofoKeyboardLayout {
    return BopomofoKeyboardLayout.IBMLayout_;
  }

  private static ETenLayout_: BopomofoKeyboardLayout =
    BopomofoKeyboardLayout.CreateETenLayout_();

  static get ETenLayout(): BopomofoKeyboardLayout {
    return BopomofoKeyboardLayout.ETenLayout_;
  }

  private static HsuLayout_: BopomofoKeyboardLayout =
    BopomofoKeyboardLayout.CreateHsuLayout_();

  static get HsuLayout(): BopomofoKeyboardLayout {
    return BopomofoKeyboardLayout.HsuLayout_;
  }

  private static ETen26Layout_: BopomofoKeyboardLayout =
    BopomofoKeyboardLayout.CreateETen26Layout_();

  static get ETen26Layout(): BopomofoKeyboardLayout {
    return BopomofoKeyboardLayout.ETen26Layout_;
  }

  private static HanyuPinyinLayout_: BopomofoKeyboardLayout =
    BopomofoKeyboardLayout.CreateHanyuPinyinLayout_();

  static get HanyuPinyinLayout(): BopomofoKeyboardLayout {
    return BopomofoKeyboardLayout.HanyuPinyinLayout_;
  }

  private name_: string;
  private componentToKey_: BopomofoComponentToKeyMap = new Map();
  private keyToComponent_: BopomofoKeyToComponentMap = new Map();

  constructor(ktcm: BopomofoKeyToComponentMap, name: string) {
    this.name_ = name;
    this.keyToComponent_ = ktcm;
    this.keyToComponent_.forEach((mapValue, mapKey) => {
      mapValue.forEach((v) => {
        this.componentToKey_[v] = mapKey;
      });
    });
  }

  get name(): string {
    return this.name_;
  }

  componentToKey(component: Component): string {
    return this.componentToKey_[component] ?? "";
  }

  keyToComponents(key: string): Component[] {
    return this.keyToComponent_[key] ?? 0;
  }

  keySequenceFromSyllable(syllable: BopomofoSyllable): string {
    let sequence = "";
    let c: Component = 0;

    function STKS_COMBINE(component) {
      if ((c = component)) {
        let k: string = this.componentToKey(c);
        if (k) sequence += k;
      }
    }
    STKS_COMBINE(syllable.consonantComponent);
    STKS_COMBINE(syllable.middleVowelComponent);
    STKS_COMBINE(syllable.vowelComponent);
    STKS_COMBINE(syllable.toneMarkerComponent);
    return sequence;
  }

  syllableFromKeySequence(sequence: string): BopomofoSyllable {
    let syllable = new BopomofoSyllable(0);
    for (let i = 0; i < sequence.length; i++) {
      let beforeSeqHasIorUE: boolean = this.sequenceContainsIorUE(
        sequence,
        0,
        i
      );
      let aheadSeqHasIorUE: boolean = this.sequenceContainsIorUE(
        sequence,
        i + 1,
        sequence.length
      );

      let components = this.keyToComponents(sequence.charAt(i));

      if (components.length === 0) continue;

      if (components.length === 1) {
        syllable.addEqual(new BopomofoSyllable(components[0]));
        continue;
      }

      let head = new BopomofoSyllable(components[0]);
      let follow = new BopomofoSyllable(components[1]);
      let ending =
        components.length > 2 ? new BopomofoSyllable(components[2]) : follow;

      // apply the I/UE + E rule
      if (
        head.vowelComponent === BopomofoSyllable.E &&
        follow.vowelComponent != BopomofoSyllable.E
      ) {
        syllable.addEqual(beforeSeqHasIorUE ? head : follow);
        continue;
      }

      if (
        head.vowelComponent != BopomofoSyllable.E &&
        follow.vowelComponent === BopomofoSyllable.E
      ) {
        syllable.addEqual(beforeSeqHasIorUE ? follow : head);
        continue;
      }

      // apply the J/Q/X + I/UE rule, only two components are allowed in the
      // components vector here
      if (head.belongsToJQXClass && !follow.belongsToJQXClass) {
        if (!syllable.isEmpty) {
          if (ending != follow) syllable.addEqual(ending);
        } else {
          syllable.addEqual(aheadSeqHasIorUE ? head : follow);
        }
        continue;
      }

      if (!head.belongsToJQXClass && follow.belongsToJQXClass) {
        if (!syllable.isEmpty) {
          if (ending != follow) syllable.addEqual(ending);
        } else {
          syllable.addEqual(aheadSeqHasIorUE ? follow : head);
        }
        continue;
      }

      // the nasty issue of only one char in the buffer
      if (i === 0 && i + 1 === sequence.length - 1) {
        if (head.hasVowel || follow.hasToneMarker || head.belongsToZCSRClass) {
          syllable.addEqual(head);
        } else {
          if (follow.hasVowel || ending.hasToneMarker) {
            syllable.addEqual(follow);
          } else {
            syllable.addEqual(ending);
          }
        }
        continue;
      }

      if (
        !(syllable.maskType & head.maskType) &&
        !this.endAheadOrAheadHasToneMarkKey(sequence, i + 1, sequence.length)
      ) {
        syllable.addEqual(head);
      } else {
        if (
          this.endAheadOrAheadHasToneMarkKey(
            sequence,
            i + 1,
            sequence.length
          ) &&
          head.belongsToZCSRClass &&
          syllable.isEmpty
        ) {
          syllable.addEqual(head);
        } else if (syllable.maskType < follow.maskType) {
          syllable.addEqual(follow);
        } else {
          syllable.addEqual(ending);
        }
      }
    }

    // TODO
    let isHsu: boolean = this === BopomofoKeyboardLayout.HsuLayout;
    if (isHsu) {
      // fix the left out L to ERR when it has sound, and GI, GUE -> JI, JUE
      if (
        syllable.vowelComponent === BopomofoSyllable.ENG &&
        !syllable.hasConsonant &&
        !syllable.hasMiddleVowel
      ) {
        syllable.addEqual(new BopomofoSyllable(BopomofoSyllable.ERR));
      } else if (
        syllable.consonantComponent === BopomofoSyllable.G &&
        (syllable.middleVowelComponent === BopomofoSyllable.I ||
          syllable.middleVowelComponent === BopomofoSyllable.UE)
      ) {
        syllable.addEqual(new BopomofoSyllable(BopomofoSyllable.J));
      }
    }

    return syllable;
  }

  private endAheadOrAheadHasToneMarkKey(
    seq: string,
    ahead: number,
    end: number
  ): boolean {
    if (ahead === end) return true;

    let tone1 = this.componentToKey(BopomofoSyllable.Tone1);
    let tone2 = this.componentToKey(BopomofoSyllable.Tone2);
    let tone3 = this.componentToKey(BopomofoSyllable.Tone3);
    let tone4 = this.componentToKey(BopomofoSyllable.Tone4);
    let tone5 = this.componentToKey(BopomofoSyllable.Tone5);

    if (tone1 != undefined) {
      if (seq[ahead] === tone1) return true;
    }

    if (
      seq[ahead] === tone2 ||
      seq[ahead] === tone3 ||
      seq[ahead] === tone4 ||
      seq[ahead] === tone5
    ) {
      return true;
    }

    return false;
  }

  private sequenceContainsIorUE(seq: string, ahead: number, end: number) {
    let iChar = this.componentToKey(BopomofoSyllable.I);
    let ueChar = this.componentToKey(BopomofoSyllable.UE);
    for (let i = ahead; i < end; i++) {
      if (seq[i] === iChar || seq[i] === ueChar) return true;
    }
    return false;
  }

  private static CreateStandardLayout_(): BopomofoKeyboardLayout {
    let ktcm: BopomofoKeyToComponentMap = new Map([
      ["1", [BopomofoSyllable.B]],
      ["q", [BopomofoSyllable.P]],
      ["a", [BopomofoSyllable.M]],
      ["z", [BopomofoSyllable.F]],
      ["2", [BopomofoSyllable.D]],
      ["w", [BopomofoSyllable.T]],
      ["s", [BopomofoSyllable.N]],
      ["x", [BopomofoSyllable.L]],
      ["e", [BopomofoSyllable.G]],
      ["d", [BopomofoSyllable.K]],
      ["c", [BopomofoSyllable.H]],
      ["r", [BopomofoSyllable.J]],
      ["f", [BopomofoSyllable.Q]],
      ["v", [BopomofoSyllable.X]],
      ["5", [BopomofoSyllable.ZH]],
      ["t", [BopomofoSyllable.CH]],
      ["g", [BopomofoSyllable.SH]],
      ["b", [BopomofoSyllable.R]],
      ["y", [BopomofoSyllable.Z]],
      ["h", [BopomofoSyllable.C]],
      ["n", [BopomofoSyllable.S]],
      ["u", [BopomofoSyllable.I]],
      ["j", [BopomofoSyllable.U]],
      ["m", [BopomofoSyllable.UE]],
      ["8", [BopomofoSyllable.A]],
      ["i", [BopomofoSyllable.O]],
      ["k", [BopomofoSyllable.ER]],
      [",", [BopomofoSyllable.E]],
      ["9", [BopomofoSyllable.AI]],
      ["o", [BopomofoSyllable.EI]],
      ["l", [BopomofoSyllable.AO]],
      [".", [BopomofoSyllable.OU]],
      ["0", [BopomofoSyllable.AN]],
      ["p", [BopomofoSyllable.EN]],
      [";", [BopomofoSyllable.ANG]],
      ["/", [BopomofoSyllable.ENG]],
      ["-", [BopomofoSyllable.ERR]],
      ["3", [BopomofoSyllable.Tone3]],
      ["4", [BopomofoSyllable.Tone4]],
      ["6", [BopomofoSyllable.Tone2]],
      ["7", [BopomofoSyllable.Tone5]],
    ]);
    return new BopomofoKeyboardLayout(ktcm, "Standard");
  }

  static CreateIBMLayout_(): BopomofoKeyboardLayout {
    let ktcm: BopomofoKeyToComponentMap = new Map([
      ["1", [BopomofoSyllable.B]],
      ["2", [BopomofoSyllable.P]],
      ["3", [BopomofoSyllable.M]],
      ["4", [BopomofoSyllable.F]],
      ["5", [BopomofoSyllable.D]],
      ["6", [BopomofoSyllable.T]],
      ["7", [BopomofoSyllable.N]],
      ["8", [BopomofoSyllable.L]],
      ["9", [BopomofoSyllable.G]],
      ["0", [BopomofoSyllable.K]],
      ["-", [BopomofoSyllable.H]],
      ["q", [BopomofoSyllable.J]],
      ["w", [BopomofoSyllable.Q]],
      ["e", [BopomofoSyllable.X]],
      ["r", [BopomofoSyllable.ZH]],
      ["t", [BopomofoSyllable.CH]],
      ["y", [BopomofoSyllable.SH]],
      ["u", [BopomofoSyllable.R]],
      ["i", [BopomofoSyllable.Z]],
      ["o", [BopomofoSyllable.C]],
      ["p", [BopomofoSyllable.S]],
      ["a", [BopomofoSyllable.I]],
      ["s", [BopomofoSyllable.U]],
      ["d", [BopomofoSyllable.UE]],
      ["f", [BopomofoSyllable.A]],
      ["g", [BopomofoSyllable.O]],
      ["h", [BopomofoSyllable.ER]],
      ["j", [BopomofoSyllable.E]],
      ["k", [BopomofoSyllable.AI]],
      ["l", [BopomofoSyllable.EI]],
      [";", [BopomofoSyllable.AO]],
      ["z", [BopomofoSyllable.OU]],
      ["x", [BopomofoSyllable.AN]],
      ["c", [BopomofoSyllable.EN]],
      ["v", [BopomofoSyllable.ANG]],
      ["b", [BopomofoSyllable.ENG]],
      ["n", [BopomofoSyllable.ERR]],
      ["m", [BopomofoSyllable.Tone2]],
      [",", [BopomofoSyllable.Tone3]],
      [".", [BopomofoSyllable.Tone4]],
      ["/", [BopomofoSyllable.Tone5]],
    ]);
    return new BopomofoKeyboardLayout(ktcm, "IBM");
  }

  static CreateETenLayout_(): BopomofoKeyboardLayout {
    let ktcm: BopomofoKeyToComponentMap = new Map([
      ["b", [BopomofoSyllable.B]],
      ["p", [BopomofoSyllable.P]],
      ["m", [BopomofoSyllable.M]],
      ["f", [BopomofoSyllable.F]],
      ["d", [BopomofoSyllable.D]],
      ["t", [BopomofoSyllable.T]],
      ["n", [BopomofoSyllable.N]],
      ["l", [BopomofoSyllable.L]],
      ["v", [BopomofoSyllable.G]],
      ["k", [BopomofoSyllable.K]],
      ["h", [BopomofoSyllable.H]],
      ["g", [BopomofoSyllable.J]],
      ["7", [BopomofoSyllable.Q]],
      ["c", [BopomofoSyllable.X]],
      [",", [BopomofoSyllable.ZH]],
      [".", [BopomofoSyllable.CH]],
      ["/", [BopomofoSyllable.SH]],
      ["j", [BopomofoSyllable.R]],
      [";", [BopomofoSyllable.Z]],
      ["'", [BopomofoSyllable.C]],
      ["s", [BopomofoSyllable.S]],
      ["e", [BopomofoSyllable.I]],
      ["x", [BopomofoSyllable.U]],
      ["u", [BopomofoSyllable.UE]],
      ["a", [BopomofoSyllable.A]],
      ["o", [BopomofoSyllable.O]],
      ["r", [BopomofoSyllable.ERR]],
      ["w", [BopomofoSyllable.E]],
      ["i", [BopomofoSyllable.AI]],
      ["q", [BopomofoSyllable.EI]],
      ["z", [BopomofoSyllable.AO]],
      ["y", [BopomofoSyllable.OU]],
      ["8", [BopomofoSyllable.AN]],
      ["9", [BopomofoSyllable.EN]],
      ["0", [BopomofoSyllable.ANG]],
      ["-", [BopomofoSyllable.ENG]],
      ["=", [BopomofoSyllable.ERR]],
      ["2", [BopomofoSyllable.Tone2]],
      ["3", [BopomofoSyllable.Tone3]],
      ["4", [BopomofoSyllable.Tone4]],
      ["1", [BopomofoSyllable.Tone5]],
    ]);
    return new BopomofoKeyboardLayout(ktcm, "ETen");
  }

  static CreateHsuLayout_(): BopomofoKeyboardLayout {
    let ktcm: BopomofoKeyToComponentMap = new Map([
      ["b", [BopomofoSyllable.B]],
      ["p", [BopomofoSyllable.P]],
      ["m", [BopomofoSyllable.M, BopomofoSyllable.AN]],
      ["f", [BopomofoSyllable.F, BopomofoSyllable.Tone3]],
      ["d", [BopomofoSyllable.D, BopomofoSyllable.Tone2]],
      ["t", [BopomofoSyllable.T]],
      ["n", [BopomofoSyllable.N, BopomofoSyllable.EN]],
      ["l", [BopomofoSyllable.L, BopomofoSyllable.ENG, BopomofoSyllable.ERR]],
      ["g", [BopomofoSyllable.G, BopomofoSyllable.ER]],
      ["k", [BopomofoSyllable.K, BopomofoSyllable.ANG]],
      ["h", [BopomofoSyllable.H, BopomofoSyllable.O]],
      ["j", [BopomofoSyllable.J, BopomofoSyllable.ZH, BopomofoSyllable.Tone4]],
      ["v", [BopomofoSyllable.Q, BopomofoSyllable.CH]],
      ["c", [BopomofoSyllable.X, BopomofoSyllable.SH]],
      ["r", [BopomofoSyllable.R]],
      ["z", [BopomofoSyllable.Z]],
      ["a", [BopomofoSyllable.C, BopomofoSyllable.EI]],
      ["s", [BopomofoSyllable.S, BopomofoSyllable.Tone5]],
      ["e", [BopomofoSyllable.I, BopomofoSyllable.E]],
      ["x", [BopomofoSyllable.U]],
      ["u", [BopomofoSyllable.UE]],
      ["y", [BopomofoSyllable.A]],
      ["i", [BopomofoSyllable.AI]],
      ["w", [BopomofoSyllable.AO]],
      ["o", [BopomofoSyllable.OU]],
    ]);
    return new BopomofoKeyboardLayout(ktcm, "Hsu");
  }

  static CreateETen26Layout_(): BopomofoKeyboardLayout {
    let ktcm: BopomofoKeyToComponentMap = new Map([
      ["b", [BopomofoSyllable.B]],
      ["p", [BopomofoSyllable.P, BopomofoSyllable.OU]],
      ["m", [BopomofoSyllable.M, BopomofoSyllable.AN]],
      ["f", [BopomofoSyllable.F, BopomofoSyllable.Tone2]],
      ["d", [BopomofoSyllable.D, BopomofoSyllable.Tone5]],
      ["t", [BopomofoSyllable.T, BopomofoSyllable.ANG]],
      ["n", [BopomofoSyllable.N, BopomofoSyllable.EN]],
      ["l", [BopomofoSyllable.L, BopomofoSyllable.ENG]],
      ["v", [BopomofoSyllable.G, BopomofoSyllable.Q]],
      ["k", [BopomofoSyllable.K, BopomofoSyllable.Tone4]],
      ["h", [BopomofoSyllable.H, BopomofoSyllable.ERR]],
      ["g", [BopomofoSyllable.ZH, BopomofoSyllable.J]],
      ["c", [BopomofoSyllable.SH, BopomofoSyllable.X]],
      ["y", [BopomofoSyllable.CH]],
      ["j", [BopomofoSyllable.R, BopomofoSyllable.Tone3]],
      ["q", [BopomofoSyllable.Z, BopomofoSyllable.EI]],
      ["w", [BopomofoSyllable.C, BopomofoSyllable.E]],
      ["s", [BopomofoSyllable.S]],
      ["e", [BopomofoSyllable.I]],
      ["x", [BopomofoSyllable.U]],
      ["u", [BopomofoSyllable.UE]],
      ["a", [BopomofoSyllable.A]],
      ["o", [BopomofoSyllable.O]],
      ["r", [BopomofoSyllable.ER]],
      ["i", [BopomofoSyllable.AI]],
      ["z", [BopomofoSyllable.AO]],
    ]);
    return new BopomofoKeyboardLayout(ktcm, "ETen26");
  }

  static CreateHanyuPinyinLayout_(): BopomofoKeyboardLayout {
    let ktcm: BopomofoKeyToComponentMap = new Map();
    return new BopomofoKeyboardLayout(ktcm, "HanyuPinyin");
  }
}


