/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BopomofoKeyboardLayout } from "./BopomofoKeyboardLayout";
import { BopomofoSyllable } from "./BopomofoSyllable";

/**
 * The buffer used to store the Bopomofo reading.
 */
export class BopomofoReadingBuffer {
  private layout_: BopomofoKeyboardLayout;
  private syllable_: BopomofoSyllable = new BopomofoSyllable(0);
  private pinyinMode_: boolean = false;
  private pinyinSequence_: string = "";

  /**
   * Creates a new reading buffer.
   * @param layout The keyboard layout to use.
   */
  constructor(layout: BopomofoKeyboardLayout) {
    this.layout_ = layout;
    if (this.layout_ === BopomofoKeyboardLayout.HanyuPinyinLayout) {
      this.pinyinMode_ = true;
      this.pinyinSequence_ = "";
    }
  }

  /**
   * The keyboard layout used by the buffer.
   */
  public get keyboardLayout(): BopomofoKeyboardLayout {
    return this.layout_;
  }

  public set keyboardLayout(value: BopomofoKeyboardLayout) {
    this.layout_ = value;
    if (this.layout_ === BopomofoKeyboardLayout.HanyuPinyinLayout) {
      this.pinyinMode_ = true;
      this.pinyinSequence_ = "";
    } else {
      this.pinyinMode_ = false;
    }
  }

  /**
   * Checks if a key is valid for the current layout.
   * @param k The key to check.
   * @returns True if the key is valid, false otherwise.
   */
  isValidKey(k: string): boolean {
    if (!this.pinyinMode_) {
      return this.layout_.keyToComponents(k).length > 0;
    }
    if (k.length !== 1) return false;

    const lk = k.toLowerCase();
    if (lk >= "a" && lk <= "z") {
      // if a tone marker is already in place
      if (this.pinyinSequence_.length > 0) {
        const lastc = this.pinyinSequence_.charAt(
          this.pinyinSequence_.length - 1
        );
        if (lastc >= "2" && lastc <= "5") {
          return false;
        }
        return true;
      }
      return true;
    }

    if (this.pinyinSequence_.length > 0 && lk >= "2" && lk <= "5") {
      return true;
    }

    return false;
  }

  /**
   * Appends a key to the buffer.
   * @param k The key to append.
   * @returns True if the key was successfully appended, false otherwise.
   */
  combineKey(k: string): boolean {
    if (!this.isValidKey(k)) return false;

    if (this.pinyinMode_) {
      this.pinyinSequence_ += k.toLowerCase();
      this.syllable_ = BopomofoSyllable.FromHanyuPinyin(this.pinyinSequence_);
      return true;
    }

    const sequence =
      this.layout_.keySequenceFromSyllable(this.syllable_) + k.toLowerCase();
    this.syllable_ = this.layout_.syllableFromKeySequence(sequence);
    return true;
  }

  /**
   * Clears the buffer.
   */
  clear(): void {
    this.pinyinSequence_ = "";
    this.syllable_.clear();
  }

  /**
   * Removes the last key from the buffer.
   */
  backspace(): void {
    if (!this.layout_) return;

    if (this.pinyinMode_) {
      if (this.pinyinSequence_.length > 0) {
        this.pinyinSequence_ = this.pinyinSequence_.substr(
          0,
          this.pinyinSequence_.length - 1
        );
      }
      this.syllable_ = BopomofoSyllable.FromHanyuPinyin(this.pinyinSequence_);
      return;
    }

    let sequence = this.layout_.keySequenceFromSyllable(this.syllable_);
    if (sequence.length > 0) {
      sequence = sequence.substr(0, sequence.length - 1);
      this.syllable_ = this.layout_.syllableFromKeySequence(sequence);
    }
  }

  /**
   * Whether the buffer is empty.
   */
  get isEmpty(): boolean {
    return this.syllable_.isEmpty;
  }

  /**
   * The composed string of the buffer.
   */
  get composedString(): string {
    if (this.pinyinMode_) {
      return this.pinyinSequence_;
    }

    return this.syllable_.composedString;
  }

  /**
   * The current syllable in the buffer.
   */
  get syllable(): BopomofoSyllable {
    return this.syllable_;
  }

  /**
   * Returns the key sequence in the standard layout.
   * @returns The key sequence.
   */
  standardLayoutQueryString(): string {
    return BopomofoKeyboardLayout.StandardLayout.keySequenceFromSyllable(
      this.syllable_
    );
  }

  /**
   * Whether the buffer has a tone marker.
   */
  get hasToneMarker(): boolean {
    return this.syllable_.hasToneMarker;
  }

  /**
   * Whether the buffer has only a tone marker.
   */
  get hasToneMarkerOnly(): boolean {
    return (
      this.syllable_.hasToneMarker &&
      !(
        this.syllable_.hasConsonant ||
        this.syllable_.hasMiddleVowel ||
        this.syllable_.hasVowel
      )
    );
  }
}
