/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { CandidateWrapper } from "./CandidateController";

/** The style used in {@link ComposingBufferText}. */
export enum ComposingBufferTextStyle {
  Normal = "normal",
  Highlighted = "highlighted",
}

/** Represents the composing buffer. */
export class ComposingBufferText {
  /** The text contained in the composing buffer. */
  private text: string;
  /** The text style. */
  private style: ComposingBufferTextStyle;

  constructor(
    text: string,
    style: ComposingBufferTextStyle = ComposingBufferTextStyle.Normal
  ) {
    this.text = text;
    this.style = style;
  }
}

/**
 * A data transfer object for the UI state.
 */
export class InputUIState {
  /** Represents the composing buffer.   */
  readonly composingBuffer: ComposingBufferText[];

  /** The index of the cursor in the composing buffer. */
  readonly cursorIndex: number;

  /** The current page of the candidates. */
  readonly candidates: CandidateWrapper[];

  /** The total pages of the candidates, */
  readonly candidatePageCount: number;

  /** The current page index of the candidates, */
  readonly candidatePageIndex: number;

  /** The tooltip. */
  readonly tooltip: string;

  constructor(
    composingBuffer: ComposingBufferText[],
    cursorIndex: number,
    candidates: CandidateWrapper[],
    tooltip: string,
    candidatePageCount: number,
    candidatePageIndex: number
  ) {
    this.composingBuffer = composingBuffer;
    this.cursorIndex = cursorIndex;
    this.candidates = candidates;
    this.tooltip = tooltip;
    this.candidatePageCount = candidatePageCount;
    this.candidatePageIndex = candidatePageIndex;
  }
}

/**
 * A interface to let the input method module to talk to an input method
 * framework or a specific UI framework.
 */
export interface InputUI {
  /**
   * Called when the input method module wants to reset the composing buffer and
   * the candidate window.
   */
  reset(): void;

  /**
   * Called when the input method module wants to insert text into the current
   * application..
   */
  commitString(text: string): void;

  /**
   * Called when the input method module wants to update the composing buffer
   * and the candidate window.
   *
   * @param state The JSON encoded string of the UI state including the
   * composing buffer and the candidate window. See also {@link InputUIState}.
   */
  update(state: string): void;
}
