/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { read } from "fs";
import { Candidate } from "../Gramambular2";
import { BopomofoKeyboardLayout } from "../Mandarin";
import { CandidateWrapper, CandidateController } from "./CandidateController";
import { CtrlEnterOption } from "./CtrlEnterOption";
import { inputMacroController } from "./InputMacro";

import {
  Big5,
  ChineseNumber,
  ChoosingCandidate,
  Committing,
  CustomMenu,
  CustomMenuEntry,
  Empty,
  EmptyIgnoringPrevious,
  EnclosingNumber,
  InputState,
  Inputting,
  Marking,
  NotEmpty,
  SelectingDateMacro,
  SelectingDictionary,
  SelectingFeature,
} from "./InputState";

import {
  ComposingBufferText,
  ComposingBufferTextStyle,
  InputUI,
  InputUIState,
} from "./InputUI";

import { Key, KeyFromKeyboardEvent, KeyName } from "./Key";
import { KeyHandler } from "./KeyHandler";
import { LocalizedStrings } from "./LocalizedStrings";
import { webData } from "./WebData";
import { WebLanguageModel } from "./WebLanguageModel";

const ChineseConvert = require("chinese_convert");

/**
 * The main input UI controller.
 */
class InputUIController {
  private ui: InputUI;
  private cursorIndex: number = 0;
  private tooltip: string = "";
  private candidates: CandidateWrapper[] = [];
  private composingBuffer: ComposingBufferText[] = [];
  private candidateTotalPageCount = 0;
  private candidateCurrentPageIndex = 0;

  constructor(ui: InputUI) {
    this.ui = ui;
  }

  /**
   * Resets everything, including the cursor index, tooltips. candidates and so
   * on.
   */
  reset(): void {
    this.cursorIndex = 0;
    this.tooltip = "";
    this.candidates = [];
    this.composingBuffer = [];
    this.ui.reset();
  }

  /** Resets the composing buffer. */
  resetComposingBuffer(): void {
    this.composingBuffer = [];
  }

  /** Commits the composing buffer to the current app. */
  commitString(text: string): void {
    this.ui.commitString(text);
  }

  /** Appends to existing composing buffer. */
  append(text: ComposingBufferText): void {
    this.composingBuffer.push(text);
  }

  /** Sets the cursor index. */
  setCursorIndex(index: number): void {
    this.cursorIndex = index;
  }

  /** Sets the candidates.  */
  setCandidates(candidates: CandidateWrapper[]): void {
    this.candidates = candidates;
  }

  /** Updates the current candidate page and total page count. */
  setPageIndex(
    candidateCurrentPageIndex: number,
    candidateTotalPageCount: number
  ) {
    this.candidateCurrentPageIndex = candidateCurrentPageIndex;
    this.candidateTotalPageCount = candidateTotalPageCount;
  }

  /** Sets the tooltip. */
  setTooltip(tooltip: string): void {
    this.tooltip = tooltip;
  }

  /** Updates the UI. */
  update(): void {
    const state = new InputUIState(
      this.composingBuffer,
      this.cursorIndex,
      this.candidates,
      this.tooltip,
      this.candidateTotalPageCount,
      this.candidateCurrentPageIndex
    );
    const json = JSON.stringify(state);
    this.ui.update(json);
  }
}

/**
 * Controller class that manages the input method's state and handles keyboard
 * events. This class serves as the main coordinator between different
 * components of the input method, including the UI, language model, and
 * keyboard handler.
 *
 * The controller is responsible for:
 * - Managing input states (empty, inputting, choosing candidates, etc.)
 * - Handling keyboard events and routing them to appropriate handlers
 * - Managing candidate selection and display
 * - Coordinating between the UI and the language model
 * - Handling various input method configurations
 *
 * Key features:
 * - Supports multiple keyboard layouts (Standard, ETen, Hsu, etc.)
 * - Handles both traditional and simplified Chinese input
 * - Supports customizable candidate key selection
 * - Manages vertical and horizontal candidate window layouts
 * - Handles various input states and transitions
 * - Supports user phrases and dictionary lookups
 *
 * @example
 * ```typescript
 * const ui = new InputUI();
 * const controller = new InputController(ui);
 * controller.setKeyboardLayout("Standard");
 * controller.setTraditionalMode(true);
 * ```
 */
export class InputController {
  /** Gets the current input state */
  public get state(): InputState {
    return this.state_;
  }

  private state_: InputState = new Empty();
  private lm_: WebLanguageModel;
  private keyHandler_: KeyHandler;
  private candidateController_: CandidateController = new CandidateController();
  private ui_: InputUIController;
  private candidateKeys_ = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  private candidateKeysCount_: number = 9;
  private useVerticalCandidates_ = false;
  private onError_: Function | undefined;
  private useJKToMoveCursor_: boolean = false;
  private localizedStrings_ = new LocalizedStrings();

  constructor(ui: InputUI) {
    this.ui_ = new InputUIController(ui);
    this.lm_ = new WebLanguageModel(webData);
    this.keyHandler_ = new KeyHandler(this.lm_);
    this.lm_.setMacroConverter((input) => inputMacroController.handle(input));
  }

  /** Resets to empty state. */
  public reset(): void {
    this.enterNewState(new Empty());
    this.ui_.update();
    this.keyHandler_.reset();
  }

  /** Sets the UI component. */
  public setUI(ui: InputUI): void {
    this.ui_ = new InputUIController(ui);
  }

  /** Sets if the input controller should use traditional mode or not. */
  public setTraditionalMode(flag: boolean): void {
    this.keyHandler_.traditionalMode = flag;
  }

  /**
   * The language code for localized messages.
   * @param languageCode The language code.
   */
  public setLanguageCode(languageCode: string): void {
    this.keyHandler_.languageCode = languageCode;
  }

  /**
   * Sets keyboard layout.
   * @param layout Keyboard layout. It could be:
   * - "Standard"
   * - "ETen"
   * - "Hsu"
   * - "ETen26"
   * - "HanyuPinyin"
   * - "IBM"
   */
  public setKeyboardLayout(layout: string): void {
    switch (layout) {
      case "ETen":
        this.keyHandler_.keyboardLayout = BopomofoKeyboardLayout.ETenLayout;
        break;
      case "Hsu":
        this.keyHandler_.keyboardLayout = BopomofoKeyboardLayout.HsuLayout;
        break;
      case "ETen26":
        this.keyHandler_.keyboardLayout = BopomofoKeyboardLayout.ETen26Layout;
        break;
      case "HanyuPinyin":
        this.keyHandler_.keyboardLayout =
          BopomofoKeyboardLayout.HanyuPinyinLayout;
        break;
      case "IBM":
        this.keyHandler_.keyboardLayout = BopomofoKeyboardLayout.IBMLayout;
        break;
      default:
        this.keyHandler_.keyboardLayout = BopomofoKeyboardLayout.StandardLayout;
        break;
    }
  }

  /**
   * Sets if we should select the candidate before the cursor or after the
   * cursor.
   * @param option "after_cursor" or "before_cursor".
   * */
  public setSelectPhrase(option: string): void {
    const flag: boolean = option === "after_cursor";
    this.keyHandler_.selectPhraseAfterCursorAsCandidate = flag;
  }

  /**
   * Sets if the input method should move cursor after selecting a candidate.
   * @param flag To enable the function or not.
   */
  public setMoveCursorAfterSelection(flag: boolean): void {
    this.keyHandler_.moveCursorAfterSelection = flag;
  }

  /**
   * Ser if the input method should input uppercase or lowercase letters when
   * users type shift and letter keys.
   * @param letterCase "lower" or "upper".
   */
  public setLetterMode(letterCase: string): void {
    const flag = letterCase === "lower";
    this.keyHandler_.putLowercaseLettersToComposingBuffer = flag;
  }

  /**
   * Sets the candidate keys
   * @param keys The candidate keys, such "123456789".
   */
  public setCandidateKeys(keys: string): void {
    if (keys == undefined) {
      keys = "123456789";
    }
    let list: string[] = [];
    for (let i = 0; i < keys.length; i++) {
      let c = keys.charAt(i);
      c = c.toLowerCase();
      if (list.indexOf(c) >= 0) {
        continue;
      }
      list.push(c);
    }
    if (list.length < 4) return;
    if (list.length > 15) return;
    this.candidateKeys_ = list;
  }

  /**
   * Sets the number of candidate selection keys.
   * @param count - The number of candidate selection keys to set. Must be
   * between 4 and 15 inclusive.
   */
  public setCandidateKeysCount(count: number): void {
    if (count < 4) return;
    if (count > 15) return;
    this.candidateKeysCount_ = count;
  }

  /**
   * Sets whether to enable cursor movement using 'J' and 'K' keys when the
   * candidate window is visible. When enabled, users can navigate through
   * candidates using these keys similar to vim-style navigation.
   * @param flag - True to enable J/K cursor movement, false to disable
   */
  public setUseJKToMoveCursor(flag: boolean): void {
    this.useJKToMoveCursor_ = flag;
  }

  /**
   * Sets if the ESC key should clear the entire composing buffer.
   * @param flag If the ESC key should clear the entire composing buffer.
   */
  public setEscClearEntireBuffer(flag: boolean): void {
    this.keyHandler_.escKeyClearsEntireComposingBuffer = flag;
  }

  /**
   * Enables or disables the feature that allows repeated punctuation to select
   * a candidate.
   *
   * @param flag - A boolean value indicating whether the feature should be
   * enabled (true) or disabled (false).
   */
  public setRepeatedPunctuationChooseCandidate(flag: boolean): void {
    this.keyHandler_.repeatedPunctuationToSelectCandidateEnabled = flag;
  }

  /**
   * Sets if we want to use vertical or horizontal candidate window.
   * @param flag Use the vertical candidate window.
   */
  public setUserVerticalCandidates(flag: boolean): void {
    this.useVerticalCandidates_ = flag;
  }

  /**
   * Sets if we want to use half width punctuation.
   * @param enabled Use half width punctuation.
   */
  public setHalfWidthPunctuationEnabled(enabled: boolean): void {
    this.keyHandler_.halfWidthPunctuation = enabled;
  }

  /**
   * Sets the user phrases to the language model.
   * @param input The map of user phrases.
   */
  public setUserPhrases(input: Map<string, string[]> | string): void {
    // If the input is a string or a map, we send it to the language model.
    this.lm_.setUserPhrases(input);
  }

  public setExcludedPhrases(input: Map<string, string[]> | string): void {
    // If the input is a string or a map, we send it to the language model.
    this.lm_.setExcludedPhrases(input);
  }

  /**
   * Sets the callback function that would be called when the user phrase model is changed.
   * @param callback The callback function.
   */
  public setOnPhraseChange(
    callback: (map: Map<string, string[]>) => void
  ): void {
    this.lm_.setOnPhraseChange(callback);
  }

  public setOnExcludedPhraseChange(
    callback: (map: Map<string, string[]>) => void
  ): void {
    this.lm_.setOnExcludedPhraseChange(callback);
  }

  /** Sets Chinese conversion on or off. */
  public setChineseConversionEnabled(flag: boolean): void {
    (this.lm_ as WebLanguageModel).setConverter(
      flag
        ? (input) => {
            return ChineseConvert.tw2cn(input);
          }
        : undefined
    );
    (this.lm_ as WebLanguageModel).setAddUserPhraseConverter(
      flag
        ? (input) => {
            return ChineseConvert.cn2tw(input);
          }
        : undefined
    );
  }

  /**
   * Sets the error handler function for the input controller.
   * @param onError - The callback function to handle errors
   */
  public setOnError(onError: Function): void {
    this.onError_ = onError;
  }

  /** Help the controller to open a URL. */
  public setOnOpenUrl(input: ((input: string) => void) | undefined) {
    this.keyHandler_.onOpenUrl = input;
  }

  /** Sets the option for Ctrl + Enter key. */
  public setCtrlEnterOption(option: CtrlEnterOption): void {
    this.keyHandler_.ctrlEnterOption = option;
  }

  /**
   * Handles the passed keyboard events.
   * @param event The keyboard event.
   * @returns If the key is handled.
   */
  public keyEvent(event: KeyboardEvent): boolean {
    const key = KeyFromKeyboardEvent(event);
    return this.mcbopomofoKeyEvent(key);
  }

  public mcbopomofoKeyEvent(key: Key): boolean {
    const simpleAscii = key.ascii;
    if (
      (simpleAscii === "Shift" && key.name === KeyName.ASCII) ||
      simpleAscii === "Meta" ||
      simpleAscii === "Alt"
    ) {
      return false;
    }

    if (
      this.state_ instanceof ChoosingCandidate ||
      this.state_ instanceof SelectingFeature ||
      this.state_ instanceof SelectingDateMacro ||
      this.state_ instanceof SelectingDictionary ||
      this.state_ instanceof CustomMenu
    ) {
      this.handleCandidateKeyEvent(
        key,
        (newState) => {
          this.enterNewState(newState);
        },
        () => {
          this.onError_?.();
        }
      );

      if (this.state_ instanceof NotEmpty) {
        this.updatePreedit(this.state_);
      } else {
        this.ui_.update();
      }
      // Always handle the key when there is a candidate window.
      return true;
    }
    const accepted = this.keyHandler_.handle(
      key,
      this.state_,
      (newState) => {
        this.enterNewState(newState);
      },
      () => {
        this.onError_?.();
      }
    );

    if (this.state_ instanceof NotEmpty) {
      this.updatePreedit(this.state_);
    } else {
      this.ui_.update();
    }

    return accepted;
  }

  private handleCandidateKeyEvent(
    key: Key,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ) {
    // Ignores single shift tap.
    if (key.ascii === "Shift") {
      return;
    }

    const isMovingToLeft =
      (key.name === KeyName.LEFT && key.shiftPressed) ||
      (this.useJKToMoveCursor_ && key.ascii === "j");
    if (isMovingToLeft) {
      const cursor = this.keyHandler_.cursor;
      if (cursor === 0) {
        errorCallback();
        return;
      }
      const newIndex = cursor - 1;
      this.keyHandler_.cursor = newIndex;
      const state = this.keyHandler_.buildChoosingCandidateState(newIndex);
      stateCallback(state);
      return;
    }
    const isMovingToRight =
      (key.name === KeyName.RIGHT && key.shiftPressed) ||
      (this.useJKToMoveCursor_ && key.ascii === "k");
    if (isMovingToRight) {
      const cursor = this.keyHandler_.cursor;
      const max = this.keyHandler_.gridLength;
      if (cursor >= max) {
        errorCallback();
        return;
      }
      const newIndex = cursor + 1;
      this.keyHandler_.cursor = newIndex;
      let state = this.keyHandler_.buildChoosingCandidateState(newIndex);
      stateCallback(state);
      return;
    }

    const selected = this.candidateController_.selectedCandidateWithKey(
      key.ascii
    );

    if (selected != undefined) {
      if (this.state_ instanceof SelectingFeature) {
        stateCallback(this.state_.features[+selected.value].nextState());
      } else if (this.state_ instanceof SelectingDateMacro) {
        const newState = new Committing(selected.value);
        stateCallback(newState);
      } else if (this.state_ instanceof SelectingDictionary) {
        const index = +selected.value;
        this.keyHandler_.dictionaryServices.lookup(
          this.state_.selectedPrase,
          index,
          this.state_,
          stateCallback
        );
        const newState = this.state_.previousState;
        stateCallback(newState);
      } else if (this.state_ instanceof ChoosingCandidate) {
        this.keyHandler_.candidateSelected(
          selected,
          this.state_.originalCursorIndex,
          (newState) => {
            this.enterNewState(newState);
          }
        );
      }
      return;
    }

    if (key.name === KeyName.RETURN) {
      const current = this.candidateController_.selectedCandidate;
      if (this.state_ instanceof SelectingFeature) {
        stateCallback(this.state_.features[+current.value].nextState());
      } else if (this.state_ instanceof SelectingDateMacro) {
        const newState = new Committing(current.value);
        stateCallback(newState);
      } else if (this.state_ instanceof SelectingDictionary) {
        const index = +current.value;
        this.keyHandler_.dictionaryServices.lookup(
          this.state_.selectedPrase,
          index,
          this.state_,
          stateCallback
        );
        const newState = this.state_.previousState;
        stateCallback(newState);
      } else if (this.state_ instanceof ChoosingCandidate) {
        this.keyHandler_.candidateSelected(
          current,
          this.state_.originalCursorIndex,
          (newState) => {
            stateCallback(newState);
          }
        );
      } else if (this.state_ instanceof CustomMenu) {
        const entry = this.state_.entries[+current.value];
        entry.callback();
      }
      return;
    }

    let isCancelKey =
      key.name === KeyName.ESC || key.name === KeyName.BACKSPACE;

    const invalidPrefixArray = [
      "_half_punctuation_",
      "_ctrl_punctuation_",
      "_letter_",
      "_number_",
      "_punctuation_",
    ];

    if (key.ascii === "?") {
      if (this.state_ instanceof SelectingDictionary) {
        isCancelKey = true;
      } else if (this.state_ instanceof ChoosingCandidate) {
        const current = this.candidateController_.selectedCandidate;
        const phrase = current.value;
        const readings = current.reading;
        for (const prefix of invalidPrefixArray) {
          if (readings.startsWith(prefix)) {
            return true;
          }
        }

        const newState = new SelectingDictionary(
          this.state_,
          phrase,
          this.candidateController_.selectedIndex,
          this.keyHandler_.dictionaryServices.buildMenu(phrase)
        );
        stateCallback(newState);
        return;
      }
    }

    if (isCancelKey) {
      if (
        this.state_ instanceof SelectingFeature ||
        this.state_ instanceof SelectingDateMacro
      ) {
        stateCallback(new EmptyIgnoringPrevious());
      } else if (this.state_ instanceof SelectingDictionary) {
        const previous = this.state_.previousState;
        stateCallback(previous);
        if (previous instanceof ChoosingCandidate) {
          this.candidateController_.selectedIndex = this.state_.selectedIndex;
        }
      } else if (this.state_ instanceof ChoosingCandidate) {
        this.keyHandler_.candidatePanelCancelled(
          this.state_.originalCursorIndex,
          (newState) => {
            stateCallback(newState);
          }
        );
        return;
      }
      return;
    }

    if (!this.keyHandler_.traditionalMode) {
      const isPlusKey = key.ascii === "+" || key.ascii === "=";
      const isMinusKey = key.ascii === "_" || key.ascii === "-";
      if (
        this.state_ instanceof ChoosingCandidate &&
        (isPlusKey || isMinusKey)
      ) {
        const choosingCandidates = this.state_;
        const current = this.candidateController_.selectedCandidate;
        const reading = current.reading;
        for (const prefix of invalidPrefixArray) {
          if (reading.startsWith(prefix)) {
            return true;
          }
        }
        let entries: CustomMenuEntry[] = [];
        let title = "";
        if (isPlusKey) {
          title = this.localizedStrings_.boostTitle(current.value);
          const entry = new CustomMenuEntry(
            this.localizedStrings_.boost(),
            () => {
              this.keyHandler_.addUserPhrase(reading, current.value);
              const newState = this.keyHandler_.buildInputtingState();
              stateCallback(newState);
            }
          );
          entries.push(entry);
        } else if (isMinusKey) {
          title = this.localizedStrings_.excludeTitle(current.value);
          const entry = new CustomMenuEntry(
            this.localizedStrings_.exclude(),
            () => {
              this.keyHandler_.addExcludedPhrase(reading, current.value);
              const newState = this.keyHandler_.buildInputtingState();
              stateCallback(newState);
            }
          );
          entries.push(entry);
        }
        const entry = new CustomMenuEntry(
          this.localizedStrings_.cancel(),
          () => {
            stateCallback(choosingCandidates);
          }
        );
        entries.push(entry);

        const customMenu = new CustomMenu(
          choosingCandidates.composingBuffer,
          choosingCandidates.cursorIndex,
          title,
          entries,
          choosingCandidates,
          choosingCandidates.cursorIndex
        );
        stateCallback(customMenu);
        return true;
      }
    }

    if (key.name === KeyName.SPACE) {
      this.candidateController_.goToNextPageButFistWhenAtEnd();
    } else if (key.name === KeyName.LEFT) {
      if (this.useVerticalCandidates_) {
        this.candidateController_.goToPreviousPage();
      } else {
        this.candidateController_.goToPreviousItem();
      }
    } else if (key.name === KeyName.RIGHT) {
      if (this.useVerticalCandidates_) {
        this.candidateController_.goToNextPage();
      } else {
        this.candidateController_.goToNextItem();
      }
    } else if (key.name === KeyName.HOME) {
      this.candidateController_.goToFirst();
    } else if (key.name === KeyName.END) {
      this.candidateController_.goToLast();
    } else if (key.name === KeyName.UP) {
      if (this.useVerticalCandidates_) {
        this.candidateController_.goToPreviousItem();
      } else {
        this.candidateController_.goToPreviousPage();
      }
    } else if (key.name === KeyName.DOWN) {
      if (this.useVerticalCandidates_) {
        this.candidateController_.goToNextItem();
      } else {
        this.candidateController_.goToNextPage();
      }
    } else if (key.name === KeyName.PAGE_UP) {
      this.candidateController_.goToPreviousPage();
    } else if (key.name === KeyName.PAGE_DOWN) {
      this.candidateController_.goToNextPage();
    }

    const result = this.candidateController_.currentPage;
    this.ui_.setCandidates(result);
    const totalPageCount = this.candidateController_.totalPageCount;
    const pageIndex = this.candidateController_.currentPageIndex;
    this.ui_.setPageIndex(pageIndex + 1, totalPageCount);

    if (!(this.state_ instanceof ChoosingCandidate)) {
      return;
    }

    if (this.keyHandler_.traditionalMode) {
      const defaultCandidate =
        this.candidateController_.currentPage[0].candidate;
      this.keyHandler_.handlePunctuationKeyInCandidatePanelForTraditionalMode(
        key,
        defaultCandidate.value,
        stateCallback,
        errorCallback
      );
    }
  }

  private enterNewState(state: InputState): void {
    const prev = this.state_;
    if (state instanceof Empty) {
      this.handleEmpty(prev, state);
    } else if (state instanceof EmptyIgnoringPrevious) {
      this.handleEmptyIgnoringPrevious(prev, state);
    } else if (state instanceof Committing) {
      this.handleCommitting(prev, state);
    } else if (state instanceof Inputting) {
      this.handleInputting(prev, state);
    } else if (state instanceof ChoosingCandidate) {
      this.handleChoosingCandidate(prev, state);
    } else if (state instanceof Marking) {
      this.handleMarking(prev, state);
    } else if (state instanceof SelectingFeature) {
      this.handleChoosingCandidate(prev, state);
    } else if (state instanceof SelectingDateMacro) {
      this.handleChoosingCandidate(prev, state);
    } else if (state instanceof SelectingDictionary) {
      this.handleChoosingCandidate(prev, state);
    } else if (state instanceof ChineseNumber) {
      this.handleChineseNumber(prev, state);
    } else if (state instanceof Big5) {
      this.handleBig5(prev, state);
    } else if (state instanceof EnclosingNumber) {
      this.handleEnclosingNumber(prev, state);
    } else if (state instanceof CustomMenu) {
      this.handleChoosingCandidate(prev, state);
    }
    this.state_ = state;
  }

  private handleEmpty(prev: InputState, state: Empty) {
    this.ui_.reset();
    if (prev instanceof NotEmpty) {
      this.ui_.commitString(prev.composingBuffer);
    }
  }

  private handleEmptyIgnoringPrevious(
    prev: InputState,
    state: EmptyIgnoringPrevious
  ) {
    this.ui_.reset();
  }

  private handleCommitting(prev: InputState, state: Committing) {
    this.ui_.reset();
    if (state.text.length > 0) {
      this.ui_.commitString(state.text);
    }
  }

  private updatePreedit(state: NotEmpty) {
    this.ui_.resetComposingBuffer();
    if (state instanceof Marking) {
      this.ui_.append(new ComposingBufferText(state.head));
      this.ui_.append(
        new ComposingBufferText(
          state.markedText,
          ComposingBufferTextStyle.Highlighted
        )
      );
      this.ui_.append(new ComposingBufferText(state.tail));
    } else {
      this.ui_.append(new ComposingBufferText(state.composingBuffer));
    }
    this.ui_.setCursorIndex(state.cursorIndex);
    this.ui_.setTooltip(state.tooltip);
    this.ui_.update();
  }

  private handleInputting(prev: InputState, state: Inputting) {
    this.ui_.reset();
    this.updatePreedit(state);
  }

  private handleChoosingCandidate(prev: InputState, state: InputState) {
    let candidates: Candidate[] = [];
    if (state instanceof ChoosingCandidate) {
      candidates = state.candidates;
    } else if (state instanceof SelectingFeature) {
      let index = 0;
      for (const item of state.features) {
        let candidate = new Candidate("", index + "", item.name);
        candidates.push(candidate);
        index++;
      }
    } else if (state instanceof SelectingDateMacro) {
      for (const item of state.menu) {
        const candidate = new Candidate("", item, item);
        candidates.push(candidate);
      }
    } else if (state instanceof SelectingDictionary) {
      let index = 0;
      for (const item of state.menu) {
        const candidate = new Candidate("", index + "", item);
        candidates.push(candidate);
        index++;
      }
    } else if (state instanceof CustomMenu) {
      let index = 0;
      for (const item of state.entries) {
        const candidate = new Candidate("", index + "", item.title);
        candidates.push(candidate);
        index++;
      }
    }

    let keys: string[] = [];
    const min = Math.min(this.candidateKeysCount_, this.candidateKeys_.length);
    for (let i = 0; i < min; i++) {
      keys.push(this.candidateKeys_[i]);
    }

    this.candidateController_.update(candidates, keys);
    const result = this.candidateController_.currentPage;
    this.ui_.setCandidates(result);
    const totalPageCount = this.candidateController_.totalPageCount;
    const pageIndex = this.candidateController_.currentPageIndex;
    this.ui_.setPageIndex(pageIndex + 1, totalPageCount);
    if (state instanceof CustomMenu) {
      this.ui_.setTooltip(state.tooltip);
    }
  }

  private handleMarking(prev: InputState, state: Marking) {
    this.updatePreedit(state);
  }

  private handleChineseNumber(prev: InputState, state: ChineseNumber) {
    this.ui_.reset();
    const composingBuffer = state.composingBuffer;
    this.ui_.append(new ComposingBufferText(composingBuffer));
    this.ui_.setCursorIndex(composingBuffer.length);
    this.ui_.update();
  }

  private handleBig5(prev: InputState, state: Big5) {
    this.ui_.reset();
    const composingBuffer = state.composingBuffer;
    this.ui_.append(new ComposingBufferText(composingBuffer));
    this.ui_.setCursorIndex(composingBuffer.length);
    this.ui_.update();
  }
  private handleEnclosingNumber(prev: InputState, state: EnclosingNumber) {
    this.ui_.reset();
    const composingBuffer = state.composingBuffer;
    this.ui_.append(new ComposingBufferText(composingBuffer));
    this.ui_.setCursorIndex(composingBuffer.length);
    this.ui_.update();
  }
}
