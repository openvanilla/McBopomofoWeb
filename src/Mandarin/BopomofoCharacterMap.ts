/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BopomofoSyllable, Component } from "./BopomofoSyllable";

export class BopomofoCharacterMap {
  static sharedInstance: BopomofoCharacterMap = new BopomofoCharacterMap();

  private characterToComponent_: Map<string, Component> = new Map();
  get characterToComponent(): Map<string, Component> {
    return this.characterToComponent_;
  }

  private componentToCharacter_: Map<Component, string> = new Map();
  get componentToCharacter(): Map<Component, string> {
    return this.componentToCharacter_;
  }

  constructor() {
    this.characterToComponent_ = new Map([
      ["ㄅ", BopomofoSyllable.B],
      ["ㄆ", BopomofoSyllable.P],
      ["ㄇ", BopomofoSyllable.M],
      ["ㄈ", BopomofoSyllable.F],
      ["ㄉ", BopomofoSyllable.D],
      ["ㄊ", BopomofoSyllable.T],
      ["ㄋ", BopomofoSyllable.N],
      ["ㄌ", BopomofoSyllable.L],
      ["ㄎ", BopomofoSyllable.K],
      ["ㄍ", BopomofoSyllable.G],
      ["ㄏ", BopomofoSyllable.H],
      ["ㄐ", BopomofoSyllable.J],
      ["ㄑ", BopomofoSyllable.Q],
      ["ㄒ", BopomofoSyllable.X],
      ["ㄓ", BopomofoSyllable.ZH],
      ["ㄔ", BopomofoSyllable.CH],
      ["ㄕ", BopomofoSyllable.SH],
      ["ㄖ", BopomofoSyllable.R],
      ["ㄗ", BopomofoSyllable.Z],
      ["ㄘ", BopomofoSyllable.C],
      ["ㄙ", BopomofoSyllable.S],
      ["ㄧ", BopomofoSyllable.I],
      ["ㄨ", BopomofoSyllable.U],
      ["ㄩ", BopomofoSyllable.UE],
      ["ㄚ", BopomofoSyllable.A],
      ["ㄛ", BopomofoSyllable.O],
      ["ㄜ", BopomofoSyllable.ER],
      ["ㄝ", BopomofoSyllable.E],
      ["ㄞ", BopomofoSyllable.AI],
      ["ㄟ", BopomofoSyllable.EI],
      ["ㄠ", BopomofoSyllable.AO],
      ["ㄡ", BopomofoSyllable.OU],
      ["ㄢ", BopomofoSyllable.AN],
      ["ㄣ", BopomofoSyllable.EN],
      ["ㄤ", BopomofoSyllable.ANG],
      ["ㄥ", BopomofoSyllable.ENG],
      ["ㄦ", BopomofoSyllable.ERR],
      ["ˊ", BopomofoSyllable.Tone2],
      ["ˇ", BopomofoSyllable.Tone3],
      ["ˋ", BopomofoSyllable.Tone4],
      ["˙", BopomofoSyllable.Tone5],
    ]);

    this.characterToComponent_.forEach((value, key) => {
      this.componentToCharacter.set(value, key);
    });
  }
}
