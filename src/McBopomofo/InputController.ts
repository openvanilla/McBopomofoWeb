/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { Candidate } from "../Gramambular2";
import { BopomofoKeyboardLayout } from "../Mandarin";
import { CandidateWrapper, CandidateController } from "./CandidateController";
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
  SelectingFeature,
} from "./InputState";

import {
  ComposingBufferText,
  ComposingBufferTextStyle,
  InputUI,
  InputUIState,
} from "./InputUI";

import { Key, KeyName } from "./Key";
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

  reset(): void {
    this.cursorIndex = 0;
    this.tooltip = "";
    this.candidates = [];
    this.composingBuffer = [];

    this.ui.reset();
  }

  resetComposingBuffer(): void {
    this.composingBuffer = [];
  }

  commitString(text: string): void {
    this.ui.commitString(text);
  }

  append(text: ComposingBufferText): void {
    this.composingBuffer.push(text);
  }

  setCursorIndex(index: number): void {
    this.cursorIndex = index;
  }

  setCandidates(candidates: CandidateWrapper[]): void {
    this.candidates = candidates;
  }

  setPageIndex(
    candidateCurrentPageIndex: number,
    candidateTotalPageCount: number
  ) {
    this.candidateCurrentPageIndex = candidateCurrentPageIndex;
    this.candidateTotalPageCount = candidateTotalPageCount;
  }

  setTooltip(tooltip: string): void {
    this.tooltip = tooltip;
  }

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
  private useVerticalCandidates_ = false;

  constructor(ui: InputUI) {
    this.ui_ = new InputUIController(ui);
    this.lm_ = new WebLanguageModel(webData);
    this.keyHandler_ = new KeyHandler(this.lm_);
    this.lm_.setMacroConverter((input) => inputMacroController.handle(input));
  }

  /** Resets to empty state. */
  public reset(): void {
    this.keyHandler_.reset();
    this.enterNewState(new EmptyIgnoringPrevious());
  }

  /** Sets the UI component. */
  public setUI(ui: InputUI) {
    this.ui_ = new InputUIController(ui);
  }

  /** Sets if the input controller should use traditional mode or not. */
  public setTraditionalMode(flag: boolean) {
    this.keyHandler_.traditionalMode = flag;
  }

  /**
   * The language code for localized messages.
   * @param languageCode The language code.
   */
  public setLanguageCode(languageCode: string) {
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
  public setKeyboardLayout(layout: string) {
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
  public setSelectPhrase(option: string) {
    let flag: boolean = option === "after_cursor";
    this.keyHandler_.selectPhraseAfterCursorAsCandidate = flag;
  }

  /**
   * Sets if the input method should move cursor after selecting a candidate.
   * @param flag To enable the function or not.
   */
  public setMoveCursorAfterSelection(flag: boolean) {
    this.keyHandler_.moveCursorAfterSelection = flag;
  }

  /**
   * Ser if the input method should input uppercase or lowercase letters when
   * users type shift and letter keys.
   * @param letterCase "lower" or "upper".
   */
  public setLetterMode(letterCase: string) {
    let flag = letterCase === "lower";
    this.keyHandler_.putLowercaseLettersToComposingBuffer = flag;
  }

  /**
   * Sets the candidate keys
   * @param keys The candidate keys.
   */
  public setCandidateKeys(keys: string) {
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
   * Sets if the ESC key should clear the entire composing buffer.
   * @param flag If the ESC key should clear the entire composing buffer.
   */
  public setEscClearEntireBuffer(flag: boolean) {
    this.keyHandler_.escKeyClearsEntireComposingBuffer = flag;
  }

  /**
   * Sets if we want to use vertical or horizontal candidate window.
   * @param flag Use the vertical candidate window.
   */
  public setUserVerticalCandidates(flag: boolean) {
    this.useVerticalCandidates_ = flag;
  }

  /**
   * Sets the user phrases to the language model.
   * @param map The map of user phrases.
   */
  setUserPhrases(map: Map<string, string[]>): void {
    this.lm_.setUserPhrases(map);
  }

  /**
   * Sets the callback function when the user phrase model is changed.
   * @param callback The callback function.
   */
  setOnPhraseChange(callback: (map: Map<string, string[]>) => void): void {
    this.lm_.setOnPhraseChange(callback);
  }

  private chineseConversionEnabled = false;
  /** Sets Chinese conversion on or off. */
  setChineseConversionEnabled(flag: boolean) {
    this.chineseConversionEnabled = flag;
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
   * Handles the passed keyboard events.
   * @param event The keyboard event.
   * @returns If the key is handled.
   */
  keyEvent(event: KeyboardEvent): boolean {
    let key = KeyFromKeyboardEvent(event);
    return this.mcbopomofoKeyEvent(key);
  }

  mcbopomofoKeyEvent(key: Key): boolean {
    if (
      this.state_ instanceof ChoosingCandidate ||
      this.state_ instanceof SelectingFeature ||
      this.state_ instanceof SelectingDateMacro
    ) {
      this.ui_.reset();
      this.handleCandidateKeyEvent(
        key,
        (newState) => this.enterNewState(newState),
        () => {}
      );
      if (this.state_ instanceof NotEmpty) {
        this.updatePreedit(this.state_);
      } else {
        this.ui_.update();
      }
      return true;
    }
    let accepted = this.keyHandler_.handle(
      key,
      this.state_,
      (newState) => this.enterNewState(newState),
      () => {}
    );
    return accepted;
  }

  private handleCandidateKeyEvent(
    key: Key,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ) {
    let selected = this.candidateController_.selectedCandidateWithKey(
      key.ascii
    );

    if (selected != undefined) {
      if (this.state_ instanceof SelectingFeature) {
        stateCallback(this.state_.features[+selected.value].nextState());
        return;
      }

      if (this.state_ instanceof SelectingDateMacro) {
        let newState = new Committing(selected.value);
        stateCallback(newState);
        return;
      }

      this.keyHandler_.candidateSelected(selected, (newState) => {
        this.enterNewState(newState);
      });
      return;
    }

    if (key.name === KeyName.RETURN) {
      let current = this.candidateController_.selectedCandidate;
      if (this.state_ instanceof SelectingFeature) {
        stateCallback(this.state_.features[+current.value].nextState());
        return;
      }

      if (this.state_ instanceof SelectingDateMacro) {
        let newState = new Committing(current.value);
        stateCallback(newState);
        return;
      }

      this.keyHandler_.candidateSelected(current, (newState) => {
        stateCallback(newState);
      });
      return;
    }

    if (key.name === KeyName.ESC || key.name === KeyName.BACKSPACE) {
      if (
        this.state_ instanceof SelectingFeature ||
        this.state_ instanceof SelectingDateMacro
      ) {
        stateCallback(new EmptyIgnoringPrevious());
        return;
      }
      this.keyHandler_.candidatePanelCancelled((newState) => {
        stateCallback(newState);
      });
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

    let result = this.candidateController_.getCurrentPage();
    this.ui_.setCandidates(result);
    let totalPageCount = this.candidateController_.totalPageCount;
    let pageIndex = this.candidateController_.currentPageIndex;
    this.ui_.setPageIndex(pageIndex + 1, totalPageCount);

    if (this.state_ instanceof SelectingFeature) {
      return;
    }

    if (this.keyHandler_.traditionalMode) {
      let defaultCandidate =
        this.candidateController_.getCurrentPage()[0].candidate;
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
    }

    this.candidateController_.update(candidates, this.candidateKeys_);
    let result = this.candidateController_.getCurrentPage();
    this.ui_.setCandidates(result);
    let totalPageCount = this.candidateController_.totalPageCount;
    let pageIndex = this.candidateController_.currentPageIndex;
    this.ui_.setPageIndex(pageIndex + 1, totalPageCount);

    if (state instanceof NotEmpty) {
      this.updatePreedit(state);
    } else {
      this.ui_.update();
    }
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

function KeyFromKeyboardEvent(event: KeyboardEvent) {
  let keyName = KeyName.UNKNOWN;
  switch (event.code) {
    case "ArrowLeft":
      keyName = KeyName.LEFT;
      break;
    case "ArrowRight":
      keyName = KeyName.RIGHT;
      break;
    case "ArrowUp":
      keyName = KeyName.UP;
      break;
    case "ArrowDown":
      keyName = KeyName.DOWN;
      break;
    case "Home":
      keyName = KeyName.HOME;
      break;
    case "End":
      keyName = KeyName.END;
      break;
    case "Backspace":
      keyName = KeyName.BACKSPACE;
      break;
    case "Delete":
      keyName = KeyName.DELETE;
      break;
    case "Enter":
      keyName = KeyName.RETURN;
      break;
    case "Escape":
      keyName = KeyName.ESC;
      break;
    case "Space":
      keyName = KeyName.SPACE;
      break;
    case "Tab":
      keyName = KeyName.TAB;
      break;
    case "PageUp":
      keyName = KeyName.PAGE_UP;
      break;
    case "PageDown":
      keyName = KeyName.PAGE_DOWN;
      break;
    default:
      keyName = KeyName.ASCII;
      break;
  }
  let key = new Key(event.key, keyName, event.shiftKey, event.ctrlKey);
  return key;
}
