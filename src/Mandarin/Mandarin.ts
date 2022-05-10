import { BopomofoSyllable } from "./BopomofoSyllable";

type Component = number;

type BopomofoKeyToComponentMap = Map<string, Component[]>;
type BopomofoComponentToKeyMap = Map<Comment, string>;

class BopomofoKeyboardLayout {
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

      if (components.length == 0) continue;

      if (components.length == 1) {
        syllable.addEqual(new BopomofoSyllable(components[0]));
        continue;
      }

      let head = new BopomofoSyllable(components[0]);
      let follow = new BopomofoSyllable(components[1]);
      let ending =
        components.length > 2 ? new BopomofoSyllable(components[2]) : follow;

      // apply the I/UE + E rule
      if (
        head.vowelComponent == BopomofoSyllable.E &&
        follow.vowelComponent != BopomofoSyllable.E
      ) {
        syllable.addEqual(beforeSeqHasIorUE ? head : follow);
        continue;
      }

      if (
        head.vowelComponent != BopomofoSyllable.E &&
        follow.vowelComponent == BopomofoSyllable.E
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
      if (i == 0 && i + 1 == sequence.length - 1) {
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
    let isHsu: boolean = false;
    if (isHsu) {
      // fix the left out L to ERR when it has sound, and GI, GUE -> JI, JUE
      if (
        syllable.vowelComponent == BopomofoSyllable.ENG &&
        !syllable.hasConsonant &&
        !syllable.hasMiddleVowel
      ) {
        syllable.addEqual(new BopomofoSyllable(BopomofoSyllable.ERR));
      } else if (
        syllable.consonantComponent == BopomofoSyllable.G &&
        (syllable.middleVowelComponent == BopomofoSyllable.I ||
          syllable.middleVowelComponent == BopomofoSyllable.UE)
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
    if (ahead == end) return true;

    let tone1 = this.componentToKey(BopomofoSyllable.Tone1);
    let tone2 = this.componentToKey(BopomofoSyllable.Tone2);
    let tone3 = this.componentToKey(BopomofoSyllable.Tone3);
    let tone4 = this.componentToKey(BopomofoSyllable.Tone4);
    let tone5 = this.componentToKey(BopomofoSyllable.Tone5);

    if (tone1 != undefined) {
      if (seq[ahead] == tone1) return true;
    }

    if (
      seq[ahead] == tone2 ||
      seq[ahead] == tone3 ||
      seq[ahead] == tone4 ||
      seq[ahead] == tone5
    ) {
      return true;
    }

    return false;
  }

  private sequenceContainsIorUE(seq: string, ahead: number, end: number) {
    let iChar = this.componentToKey(BopomofoSyllable.I);
    let ueChar = this.componentToKey(BopomofoSyllable.UE);
    for (let i = ahead; i < end; i++) {
      if (seq[i] == iChar || seq[i] == ueChar) return true;
    }
    return false;
  }
}

class BopomofoReadingBuffer {}
