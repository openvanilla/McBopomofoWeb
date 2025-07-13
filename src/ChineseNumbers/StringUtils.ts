/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

function reverseString(str: string) {
  let result = "";
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

/**
 * Trims zeros at the start of a string.
 * @param string The string to trim.
 * @returns The trimmed string.
 */
export function TrimZerosAtStart(string: string): string {
  let nonZeroFound = false;
  let output = "";
  for (let i = 0; i < string.length; i++) {
    let c = string.charAt(i);
    if (nonZeroFound) {
      output += c;
    } else if (c != "0") {
      nonZeroFound = true;
      output += c;
    }
  }

  return output;
}

/**
 * Trims zeros at the end of a string.
 * @param string The string to trim.
 * @returns The trimmed string.
 */
export function TrimZerosAtEnd(string: string): string {
  const reverse = reverseString(string);
  const trimmed = TrimZerosAtStart(reverse);
  const result = reverseString(trimmed);
  return result;
}
