/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { Candidate } from "../Gramambular2";
import { BopomofoKeyboardLayout } from "../Mandarin";
import { CandidateWrapper, CandidateController } from "./CandidateController";
import { CtrlEnterOption } from "./CtrlEnterOption";
import { inputMacroController } from "./InputMacro";

import {
  ChineseNumber,
  ChoosingCandidate,
  Committing,
  Empty,
  EmptyIgnoringPrevious,
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
    let state = new InputUIState(
      this.composingBuffer,
      this.cursorIndex,
      this.candidates,
      this.tooltip,
      this.candidateTotalPageCount,
      this.candidateCurrentPageIndex
    );
    let json = JSON.stringify(state);
    this.ui.update(json);
  }
}

/**
 * The major class that receives the keyboard events and stores the input method
 * state. It is also the only class exported from the module.
 */
export class InputController {
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

  constructor(ui: InputUI) {
    this.ui_ = new InputUIController(ui);
    this.lm_ = new WebLanguageModel(webData);
    this.keyHandler_ = new KeyHandler(this.lm_);
    this.lm_.setMacroConverter((input) => inputMacroController.handle(input));
  }

  /** Resets to empty state. */
  public reset(): void {
    console.log("reset");
    this.keyHandler_.reset();
    this.enterNewState(new EmptyIgnoringPrevious());
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
    let flag: boolean = option === "after_cursor";
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
    let flag = letterCase === "lower";
    this.keyHandler_.putLowercaseLettersToComposingBuffer = flag;
  }

  /**
   * Sets the candidate keys
   * @param keys The candidate keys.
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

  public setCandidateKeysCount(count: number): void {
    if (count < 4) return;
    if (count > 15) return;
    this.candidateKeysCount_ = count;
  }

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
    this.lm_.setUserPhrases(input);
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

  /**
   * Sets the callback function that would be called when the a user phrase model is added.
   * @param callback The callback function.
   */
  public setOnPhraseAdded(
    callback: (key: string, phrase: string) => void
  ): void {
    this.lm_.setOnPhraseAdded(callback);
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
    let key = KeyFromKeyboardEvent(event);
    return this.mcbopomofoKeyEvent(key);
  }

  public mcbopomofoKeyEvent(key: Key): boolean {
    let simpleAscii = key.ascii;
    if (
      (simpleAscii === "Shift" && key.name == KeyName.ASCII) ||
      simpleAscii === "Meta" ||
      simpleAscii === "Alt"
    ) {
      return false;
    }

    if (
      this.state_ instanceof ChoosingCandidate ||
      this.state_ instanceof SelectingFeature ||
      this.state_ instanceof SelectingDateMacro ||
      this.state_ instanceof SelectingDictionary
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
    let accepted = this.keyHandler_.handle(
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

    let isMovingToLeft =
      (key.name === KeyName.LEFT && key.shiftPressed) ||
      (this.useJKToMoveCursor_ && key.ascii === "j");
    if (isMovingToLeft) {
      let cursor = this.keyHandler_.cursor;
      if (cursor === 0) {
        errorCallback();
        return;
      }
      let newIndex = cursor - 1;
      this.keyHandler_.cursor = newIndex;
      let state = this.keyHandler_.buildChoosingCandidateState(newIndex);
      stateCallback(state);
      return;
    }
    let isMovingToRight =
      (key.name === KeyName.RIGHT && key.shiftPressed) ||
      (this.useJKToMoveCursor_ && key.ascii === "k");
    if (isMovingToRight) {
      let cursor = this.keyHandler_.cursor;
      let max = this.keyHandler_.gridLength;
      if (cursor >= max) {
        errorCallback();
        return;
      }
      let newIndex = cursor + 1;
      this.keyHandler_.cursor = newIndex;
      let state = this.keyHandler_.buildChoosingCandidateState(newIndex);
      stateCallback(state);
      return;
    }

    let selected = this.candidateController_.selectedCandidateWithKey(
      key.ascii
    );

    if (selected != undefined) {
      if (this.state_ instanceof SelectingFeature) {
        stateCallback(this.state_.features[+selected.value].nextState());
      } else if (this.state_ instanceof SelectingDateMacro) {
        let newState = new Committing(selected.value);
        stateCallback(newState);
      } else if (this.state_ instanceof SelectingDictionary) {
        let index = +selected.value;
        this.keyHandler_.dictionaryServices.lookup(
          this.state_.selectedPrase,
          index,
          this.state_,
          stateCallback
        );
        let newState = this.state_.previousState;
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
      let current = this.candidateController_.selectedCandidate;
      if (this.state_ instanceof SelectingFeature) {
        stateCallback(this.state_.features[+current.value].nextState());
      } else if (this.state_ instanceof SelectingDateMacro) {
        let newState = new Committing(current.value);
        stateCallback(newState);
      } else if (this.state_ instanceof SelectingDictionary) {
        let index = +current.value;
        this.keyHandler_.dictionaryServices.lookup(
          this.state_.selectedPrase,
          index,
          this.state_,
          stateCallback
        );
        let newState = this.state_.previousState;
        stateCallback(newState);
      } else if (this.state_ instanceof ChoosingCandidate) {
        this.keyHandler_.candidateSelected(
          current,
          this.state_.originalCursorIndex,
          (newState) => {
            stateCallback(newState);
          }
        );
      }
      return;
    }

    let isCancelKey =
      key.name === KeyName.ESC || key.name === KeyName.BACKSPACE;

    if (key.ascii === "?") {
      if (this.state_ instanceof SelectingDictionary) {
        isCancelKey = true;
      } else if (this.state_ instanceof ChoosingCandidate) {
        let current = this.candidateController_.selectedCandidate;
        let phrase = current.value;
        let newState = new SelectingDictionary(
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
        let previous = this.state_.previousState;
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

    let result = this.candidateController_.currentPage;
    this.ui_.setCandidates(result);
    let totalPageCount = this.candidateController_.totalPageCount;
    let pageIndex = this.candidateController_.currentPageIndex;
    this.ui_.setPageIndex(pageIndex + 1, totalPageCount);

    if (!(this.state_ instanceof ChoosingCandidate)) {
      return;
    }

    if (this.keyHandler_.traditionalMode) {
      let defaultCandidate = this.candidateController_.currentPage[0].candidate;
      this.keyHandler_.handlePunctuationKeyInCandidatePanelForTraditionalMode(
        key,
        defaultCandidate.value,
        stateCallback,
        errorCallback
      );
    }
  }

  private enterNewState(state: InputState): void {
    let prev = this.state_;
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
      for (let item of state.features) {
        let candidate = new Candidate("", index + "", item.name);
        candidates.push(candidate);
        index++;
      }
    } else if (state instanceof SelectingDateMacro) {
      for (let item of state.menu) {
        let candidate = new Candidate("", item, item);
        candidates.push(candidate);
      }
    } else if (state instanceof SelectingDictionary) {
      let index = 0;
      for (let item of state.menu) {
        let candidate = new Candidate("", index + "", item);
        candidates.push(candidate);
        index++;
      }
    }

    let keys: string[] = [];
    let min = Math.min(this.candidateKeysCount_, this.candidateKeys_.length);
    for (let i = 0; i < min; i++) {
      keys.push(this.candidateKeys_[i]);
    }

    this.candidateController_.update(candidates, keys);
    let result = this.candidateController_.currentPage;
    this.ui_.setCandidates(result);
    let totalPageCount = this.candidateController_.totalPageCount;
    let pageIndex = this.candidateController_.currentPageIndex;
    this.ui_.setPageIndex(pageIndex + 1, totalPageCount);
  }

  private handleMarking(prev: InputState, state: Marking) {
    this.updatePreedit(state);
  }

  private handleChineseNumber(prev: InputState, state: ChineseNumber) {
    this.ui_.reset();
    let composingBuffer = state.composingBuffer;
    this.ui_.append(new ComposingBufferText(composingBuffer));
    this.ui_.setCursorIndex(composingBuffer.length);
    this.ui_.update();
  }
}
