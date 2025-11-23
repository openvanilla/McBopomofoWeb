/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { Candidate } from "../Gramambular2";

/** Helps to associate a candidate with a key cap. */
export class CandidateWrapper {
  constructor(
    /** The key cap. */
    public readonly keyCap: string = "",
    /** The candidate. */
    public readonly candidate: Candidate = new Candidate("", "", ""),
    /** If the candidate is selected. */
    public readonly selected: boolean = false
  ) {}

  /** Returns the reading of the candidate. */
  public get reading(): string {
    return this.candidate.reading;
  }

  /** Returns the value of the candidate. */
  public get value(): string {
    return this.candidate.value;
  }

  /** Returns the displayed text of the candidate. */
  public get displayedText(): string {
    return this.candidate.displayedText;
  }
}

/** Helps to control the candidate window. */
export class CandidateController {
  private candidates_: Candidate[] = [];
  private keyCaps_: string[] = [];
  private currentSelectedIndex_: number = 0;

  /**
   * Pass a key and return the corresponding candidate.
   * @param key The key from the keyboard, such as "1", "2", "a" and so on.
   * @returns The corresponding candidate or the undefined value.
   */
  selectedCandidateWithKey(key: string): Candidate | undefined {
    let selectedIndex = -1;
    for (let i = 0; i < this.keyCaps_.length; i++) {
      if (this.keyCaps_[i] === key) {
        selectedIndex = i;
        break;
      }
    }
    if (selectedIndex < 0) {
      return undefined;
    }
    const current = Math.floor(this.currentSelectedIndex_ / this.keyCaps_.length);
    const offset = current * this.keyCaps_.length;
    return this.candidates_[offset + selectedIndex];
  }

  /** Returns the selected candidate. */
  get selectedCandidate(): Candidate {
    return this.candidates_[this.currentSelectedIndex_];
  }

  /** Returns the selected index. */
  get selectedIndex(): number {
    return this.currentSelectedIndex_;
  }

  /** Sets the selected index. */
  set selectedIndex(input: number) {
    this.currentSelectedIndex_ = input;
  }

  /** Returns the current page index. */
  get currentPageIndex(): number {
    if (this.keyCaps_.length === 0) {
      return 0;
    }
    return Math.floor(this.currentSelectedIndex_ / this.keyCaps_.length);
  }

  /** Returns the total page count. */
  get totalPageCount(): number {
    if (this.keyCaps_.length === 0) {
      return 0;
    }
    return Math.ceil(this.candidates_.length / this.keyCaps_.length);
  }

  /**
   * Updates the content of the candidate window.
   * @param candidates All candidates.
   * @param keyCaps The key caps such as "123456789", "asdfghjkl" and so on.
   */
  update(candidates: Candidate[], keyCaps: string[]) {
    this.candidates_ = candidates;
    this.keyCaps_ = keyCaps;
    this.currentSelectedIndex_ = 0;
  }

  /** Returns in candidate in the current page. */
  get currentPage(): CandidateWrapper[] {
    const startPage = Math.floor(
      this.currentSelectedIndex_ / this.keyCaps_.length
    );
    var start = startPage * this.keyCaps_.length;
    var endPage = startPage + 1;
    var end = Math.min(endPage * this.keyCaps_.length, this.candidates_.length);
    let keyCapIndex = 0;

    var list: CandidateWrapper[] = [];
    for (let i = start; i < end; i++) {
      const candidate = new CandidateWrapper(
        this.keyCaps_[keyCapIndex],
        this.candidates_[i],
        i === this.currentSelectedIndex_
      );
      list.push(candidate);
      keyCapIndex++;
    }
    return list;
  }

  /** Moves to the first one of all candidates. */
  goToFirst(): void {
    this.currentSelectedIndex_ = 0;
  }

  /** Moves to the last one of all candidates. */
  goToLast(): void {
    if (this.candidates_.length === 0) return;
    this.currentSelectedIndex_ = this.candidates_.length - 1;
  }

  /** Moves to the previous candidate. */
  goToPreviousItem(): void {
    if (this.currentSelectedIndex_ <= 0) {
      return;
    }
    this.currentSelectedIndex_--;
  }

  /** Moves to the next candidate. */
  goToNextItem(): void {
    if (this.currentSelectedIndex_ >= this.candidates_.length - 1) {
      return;
    }
    this.currentSelectedIndex_++;
  }

  /** Moves to the previous page. */
  goToPreviousPage(): void {
    let current = Math.floor(this.currentSelectedIndex_ / this.keyCaps_.length);
    if (current === 0) {
      return;
    }
    current -= 1;
    this.currentSelectedIndex_ = current * this.keyCaps_.length;
  }

  /** Moves to the next page. */
  goToNextPage(): void {
    let current = Math.floor(this.currentSelectedIndex_ / this.keyCaps_.length);
    const last = Math.floor((this.candidates_.length - 1) / this.keyCaps_.length);
    if (current === last) {
      return;
    }
    current += 1;
    this.currentSelectedIndex_ = current * this.keyCaps_.length;
  }

  /** Moves to the next page. If it is already at the last page, moves to the
   * first page. */
  goToNextPageButFirstWhenAtEnd(): void {
    let current = Math.floor(this.currentSelectedIndex_ / this.keyCaps_.length);
    const last = Math.floor((this.candidates_.length - 1) / this.keyCaps_.length);
    if (current === last) {
      this.currentSelectedIndex_ = 0;
      return;
    }
    current += 1;
    this.currentSelectedIndex_ = current * this.keyCaps_.length;
  }
}
