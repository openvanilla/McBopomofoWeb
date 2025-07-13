/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

/**
 * Represents the letters.
 * @enum {string}
 */
export enum Letter {
  a = "a",
  b = "b",
  c = "c",
  d = "d",
  e = "e",
  f = "f",
  g = "g",
  h = "h",
  i = "i",
  j = "j",
  k = "k",
  l = "l",
  m = "m",
  n = "n",
  o = "o",
  p = "p",
  q = "q",
  r = "r",
  s = "s",
  t = "t",
  u = "u",
  v = "v",
  w = "w",
  x = "x",
  y = "y",
  z = "z",
}
export namespace Letter {
  const map = new Map<Letter, string[]>([
    [Letter.a, ["⠁", "1"]],
    [Letter.b, ["⠃", "12"]],
    [Letter.c, ["⠉", "14"]],
    [Letter.d, ["⠙", "145"]],
    [Letter.e, ["⠑", "15"]],
    [Letter.f, ["⠋", "124"]],
    [Letter.g, ["⠛", "1245"]],
    [Letter.h, ["⠓", "125"]],
    [Letter.i, ["⠊", "24"]],
    [Letter.j, ["⠚", "245"]],
    [Letter.k, ["⠅", "13"]],
    [Letter.l, ["⠇", "123"]],
    [Letter.m, ["⠍", "134"]],
    [Letter.n, ["⠝", "1345"]],
    [Letter.o, ["⠕", "135"]],
    [Letter.p, ["⠏", "1234"]],
    [Letter.q, ["⠟", "12345"]],
    [Letter.r, ["⠗", "1235"]],
    [Letter.s, ["⠎", "234"]],
    [Letter.t, ["⠞", "2345"]],
    [Letter.u, ["⠥", "136"]],
    [Letter.v, ["⠧", "1236"]],
    [Letter.w, ["⠺", "2456"]],
    [Letter.x, ["⠭", "1346"]],
    [Letter.y, ["⠽", "13456"]],
    [Letter.z, ["⠵", "1356"]],
  ]);
  export const allLetter: string[] = Array.from(map.keys());
  export const allBraille: string[] = Array.from(map.values()).map((v) => v[0]);

  export function fromLetter(b: string): Letter | undefined {
    if (map.has(b as Letter)) {
      return b as Letter;
    }
    return undefined;
  }
  export function fromBraille(b: string): Letter | undefined {
    for (let [key, value] of map) {
      if (value[0] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function fromBrailleCode(b: string): Letter | undefined {
    for (let [key, value] of map) {
      if (value[1] === b) {
        return key;
      }
    }
    return undefined;
  }
  export function toLetter(c: Letter): string {
    return c;
  }
  export function toBraille(c: Letter): string {
    return (map.get(c) as string[])[0];
  }
  export function toBrailleCode(c: Letter): string {
    return (map.get(c) as string[])[1];
  }
}

