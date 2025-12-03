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
  /**
   * Constructs a `ComposingBufferText` object.
   * @param text The text content of the buffer segment.
   * @param style The style of the text content. Defaults to `ComposingBufferTextStyle.Normal`.
   */
  constructor(
    private text: string,
    private style: ComposingBufferTextStyle = ComposingBufferTextStyle.Normal
  ) {}
}

/**
 * A data transfer object for the UI state.
 */
export class InputUIState {
  /**
   * Constructs an InputUIState object.
   * @param composingBuffer An array of `ComposingBufferText` representing the current composing buffer.
   * @param cursorIndex The current position of the cursor within the composing buffer.
   * @param candidates An array of `CandidateWrapper` representing the available candidates.
   * @param tooltip A string to be displayed as a tooltip.
   * @param candidatePageCount The total number of candidate pages.
   * @param candidatePageIndex The current page index of candidates.
   */
  constructor(
    readonly composingBuffer: ComposingBufferText[],
    readonly cursorIndex: number,
    readonly candidates: CandidateWrapper[],
    readonly tooltip: string,
    readonly candidatePageCount: number,
    readonly candidatePageIndex: number
  ) {}
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
