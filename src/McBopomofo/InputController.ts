/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { Candidate } from "../Gramambular2";
import { BopomofoKeyboardLayout } from "../Mandarin";
import {
  CandidateWrapper,
  CandidateController,
  KeyCap,
} from "./CandidateController";
import { CtrlEnterOption } from "./CtrlEnterOption";
import { inputMacroController } from "./InputMacro";

import {
  Big5,
  ChoosingCandidate,
  Committing,
  CustomMenu,
  CustomMenuEntry,
  Empty,
  EmptyIgnoringPrevious,
  InputState,
  Inputting,
  Marking,
  NotEmpty,
  NumberInput,
  SelectingDateMacro,
  SelectingDictionary,
  SelectingFeature,
  ShowingCharInfo,
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
import { webDataPlain } from "./WebDataPlain";
import { WebLanguageModel } from "./WebLanguageModel";

const ChineseConvert = require("chinese_convert");

/**
 * The main input UI controller.
 */
class InputUIController {
  private cursorIndex_: number = 0;
  private tooltip_: string = "";
  private candidates_: CandidateWrapper[] = [];
  private composingBuffer_: ComposingBufferText[] = [];
  private candidateTotalPageCount_: number = 0;
  private candidateCurrentPageIndex_: number = 0;

  constructor(private ui: InputUI) {}

  /**
   * Resets everything, including the cursor index, tooltips. candidates and so
   * on.
   */
  reset(): void {
    this.cursorIndex_ = 0;
    this.tooltip_ = "";
    this.candidates_ = [];
    this.composingBuffer_ = [];
    this.ui.reset();
  }

  /** Resets the composing buffer. */
  resetComposingBuffer(): void {
    this.composingBuffer_ = [];
  }

  /** Commits the composing buffer to the current app. */
  commitString(text: string): void {
    this.ui.commitString(text);
  }

  /** Appends to existing composing buffer. */
  append(text: ComposingBufferText): void {
    this.composingBuffer_.push(text);
  }
  /** Appends to existing composing buffer. */
  setComposingBuffer(buffer: ComposingBufferText[]): void {
    this.composingBuffer_ = buffer;
  }

  /** Sets the cursor index. */
  setCursorIndex(index: number): void {
    this.cursorIndex_ = index;
  }

  /** Sets the candidates.  */
  setCandidates(candidates: CandidateWrapper[]): void {
    this.candidates_ = candidates;
  }

  /** Updates the current candidate page and total page count. */
  setPageIndex(
    candidateCurrentPageIndex: number,
    candidateTotalPageCount: number
  ) {
    this.candidateCurrentPageIndex_ = candidateCurrentPageIndex;
    this.candidateTotalPageCount_ = candidateTotalPageCount;
  }

  /** Sets the tooltip. */
  setTooltip(tooltip: string): void {
    this.tooltip_ = tooltip;
  }

  /** Updates the UI. */
  update(): void {
    const state = new InputUIState(
      this.composingBuffer_,
      this.cursorIndex_,
      this.candidates_,
      this.tooltip_,
      this.candidateTotalPageCount_,
      this.candidateCurrentPageIndex_
    );
    const json = JSON.stringify(state);
    this.ui.update(json);
  }
}

/**
 * Enumeration for moving cursor options.
 * @enum {number}
 * @property {number} Disabled - Cursor movement is disabled (0).
 * @property {number} UseJK - Use J and K keys for cursor movement (1).
 * @property {number} UseHL - Use H and L keys for cursor movement (2).
 */
export enum MovingCursorOption {
  Disabled = 0,
  UseJK = 1,
  UseHL = 2,
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
  private mcBopomofoLm_: WebLanguageModel;
  private plainBopomofoLm_: WebLanguageModel;
  private keyHandler_: KeyHandler;
  private candidateController_: CandidateController = new CandidateController();
  private ui_: InputUIController;
  private candidateKeys_ = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  private candidateKeysCount_: number = 9;
  private useVerticalCandidates_ = false;
  private onError_: Function | undefined;
  private movingCursorOption_: MovingCursorOption = MovingCursorOption.Disabled;
  private localizedStrings_ = new LocalizedStrings();

  constructor(ui: InputUI) {
    this.ui_ = new InputUIController(ui);
    this.mcBopomofoLm_ = new WebLanguageModel(webData);
    this.plainBopomofoLm_ = new WebLanguageModel(webDataPlain);
    this.lm_ = this.mcBopomofoLm_;
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
    const languageCode = this.keyHandler_.languageCode;
    const selectPhraseAfterCursorAsCandidate =
      this.keyHandler_.selectPhraseAfterCursorAsCandidate;
    const moveCursorAfterSelection = this.keyHandler_.moveCursorAfterSelection;
    const putLowercaseLettersToComposingBuffer =
      this.keyHandler_.putLowercaseLettersToComposingBuffer;
    const escKeyClearsEntireComposingBuffer_ =
      this.keyHandler_.escKeyClearsEntireComposingBuffer;
    const keyboardLayout = this.keyHandler_.keyboardLayout;
    const halfWidthPunctuation = this.keyHandler_.halfWidthPunctuation;
    const repeatedPunctuationToSelectCandidateEnabled =
      this.keyHandler_.repeatedPunctuationToSelectCandidateEnabled;
    const onError = this.onError_;
    const onOpenUrl = this.keyHandler_.onOpenUrl;
    const ctrlEnterOption = this.keyHandler_.ctrlEnterOption;

    const macroConverter = this.lm_.getMacroConverter();
    const converter = this.lm_.getConverter();
    const addUserPhraseConverter = this.lm_.getAddUserPhraseConverter();
    const excludedPhraseConverter = this.lm_.getExcludedPhraseConverter();
    const userPhrases = this.lm_.getUserPhrases();
    const excludedPhrases = this.lm_.getExcludedPhrases();

    if (flag) {
      this.lm_ = this.plainBopomofoLm_;
    } else {
      this.lm_ = this.mcBopomofoLm_;
    }

    this.lm_.setMacroConverter(macroConverter);
    this.lm_.setConverter(converter);
    this.lm_.setAddUserPhraseConverter(addUserPhraseConverter);
    this.lm_.setExcludedPhraseConverter(excludedPhraseConverter);
    this.lm_.setUserPhrases(userPhrases);
    this.lm_.setExcludedPhrases(excludedPhrases);

    this.keyHandler_ = new KeyHandler(this.lm_);
    this.keyHandler_.traditionalMode = flag;
    this.keyHandler_.languageCode = languageCode;
    this.keyHandler_.selectPhraseAfterCursorAsCandidate =
      selectPhraseAfterCursorAsCandidate;
    this.keyHandler_.moveCursorAfterSelection = moveCursorAfterSelection;
    this.keyHandler_.putLowercaseLettersToComposingBuffer =
      putLowercaseLettersToComposingBuffer;
    this.keyHandler_.escKeyClearsEntireComposingBuffer =
      escKeyClearsEntireComposingBuffer_;
    this.keyHandler_.keyboardLayout = keyboardLayout;
    this.keyHandler_.halfWidthPunctuation = halfWidthPunctuation;
    this.keyHandler_.repeatedPunctuationToSelectCandidateEnabled =
      repeatedPunctuationToSelectCandidateEnabled;
    this.onError_ = onError;
    this.keyHandler_.onOpenUrl = onOpenUrl;
    this.keyHandler_.ctrlEnterOption = ctrlEnterOption;
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
    if (keys === undefined) {
      keys = "123456789";
    }
    const list: string[] = [];
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
  public setMovingCursorOption(option: MovingCursorOption): void {
    this.movingCursorOption_ = option;
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

  public getOnError(): Function | undefined {
    return this.onError_;
  }

  /** Help the controller to open a URL. */
  public setOnOpenUrl(input: ((input: string) => void) | undefined) {
    this.keyHandler_.onOpenUrl = input;
  }

  public getOnOpenUrl(): ((input: string) => void) | undefined {
    return this.keyHandler_.onOpenUrl;
  }

  /** Sets the option for Ctrl + Enter key. */
  public setCtrlEnterOption(option: CtrlEnterOption): void {
    this.keyHandler_.ctrlEnterOption = option;
  }

  public getCtrlEnterOption(): CtrlEnterOption {
    return this.keyHandler_.ctrlEnterOption;
  }

  public selectCandidateAtIndex(candidateID: number): void {
    const selected = this.candidateController_.candidateAtIndex(candidateID);
    if (selected !== undefined) {
      this.handleSelectedCandidate_(
        selected,
        (newState) => this.enterNewState(newState),
        () => this.onError_?.()
      );
    }
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
    if (this.state_ instanceof Committing) {
      this.state_ = new Empty();
    }
    if (
      (simpleAscii === "Shift" && key.name === KeyName.ASCII) ||
      (simpleAscii === "Ctrl" && key.name === KeyName.ASCII) ||
      simpleAscii === "Meta" ||
      simpleAscii === "Alt"
    ) {
      return false;
    }
    if (this.state_ instanceof Empty) {
      if (key.isCursorKey || key.isNumpadKey || key.isDeleteKey) {
        return false;
      }
    }

    const maybeNumberInput = this.state_;
    // Number input has both key handling and candidate window, so we should
    // handle it first.
    if (maybeNumberInput instanceof NumberInput) {
      const result = this.keyHandler_.handleNumberInput(
        key,
        maybeNumberInput,
        (newState) => this.enterNewState(newState),
        () => this.onError_?.()
      );
      if (result) {
        return true;
      }
      // Note: if it is number input and there is no candidates, we don't go to
      // next step to try to handle the candidate list.
      if ((maybeNumberInput as NumberInput).candidates.length === 0) {
        return true;
      }
    }
    if (
      this.state_ instanceof ChoosingCandidate ||
      this.state_ instanceof SelectingFeature ||
      this.state_ instanceof SelectingDateMacro ||
      this.state_ instanceof SelectingDictionary ||
      this.state_ instanceof CustomMenu ||
      this.state_ instanceof ShowingCharInfo ||
      this.state_ instanceof NumberInput
    ) {
      this.handleCandidateKeyEvent(
        key,
        (newState) => this.enterNewState(newState),
        () => this.onError_?.()
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
      (newState) => this.enterNewState(newState),
      () => this.onError_?.()
    );

    if (this.state_ instanceof NotEmpty) {
      this.updatePreedit(this.state_);
    } else {
      this.ui_.update();
    }

    return accepted;
  }

  private handleSelectedCandidate_(
    selected: Candidate,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): void {
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
    } else if (this.state_ instanceof NumberInput) {
      const newState = new Committing(selected.value);
      stateCallback(newState);
    } else if (this.state_ instanceof ChoosingCandidate) {
      this.keyHandler_.candidateSelected(
        selected,
        this.state_.originalCursorIndex,
        (newState) => {
          this.enterNewState(newState);
        }
      );
    } else if (this.state_ instanceof CustomMenu) {
      const entry = this.state_.entries[+selected.value];
      entry.callback();
    } else if (this.state_ instanceof ShowingCharInfo) {
      const previous = this.state_.previousState;
      stateCallback(previous);
    }
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
      (this.movingCursorOption_ === MovingCursorOption.UseJK &&
        key.ascii === "j") ||
      (this.movingCursorOption_ === MovingCursorOption.UseHL &&
        key.ascii === "h");
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
      (this.movingCursorOption_ === MovingCursorOption.UseJK &&
        key.ascii === "k") ||
      (this.movingCursorOption_ === MovingCursorOption.UseHL &&
        key.ascii === "l");
    if (isMovingToRight) {
      const cursor = this.keyHandler_.cursor;
      const max = this.keyHandler_.gridLength;
      if (cursor >= max) {
        errorCallback();
        return;
      }
      const newIndex = cursor + 1;
      this.keyHandler_.cursor = newIndex;
      const state = this.keyHandler_.buildChoosingCandidateState(newIndex);
      stateCallback(state);
      return;
    }

    let keyToTest = key.ascii;

    {
      const selected =
        this.candidateController_.selectedCandidateWithKey(keyToTest);
      if (selected !== undefined) {
        this.handleSelectedCandidate_(selected, stateCallback, errorCallback);
        return;
      }
    }

    if (key.name === KeyName.RETURN) {
      const selected = this.candidateController_.selectedCandidate;
      if (selected === undefined) {
        return;
      }
      this.handleSelectedCandidate_(selected, stateCallback, errorCallback);
      return;
    }

    let isCancelKey =
      key.name === KeyName.ESC || key.name === KeyName.BACKSPACE;

    const invalidPrefixArray = [
      "_half_punctuation_",
      "_ctrl_punctuation_",
      "_punctuation_",
      "_letter_",
      "_number_",
      "_numpad_",
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
        const current = this.state_;
        const previous = this.state_.previousState;
        stateCallback(previous);
        if (previous instanceof ChoosingCandidate) {
          this.candidateController_.selectedIndex = current.selectedIndex;
        }
      } else if (this.state_ instanceof ChoosingCandidate) {
        this.keyHandler_.candidatePanelCancelled(
          this.state_.originalCursorIndex,
          (newState) => {
            stateCallback(newState);
          }
        );
      } else if (this.state_ instanceof CustomMenu) {
        const cursor = this.keyHandler_.cursor;
        const choosing = this.keyHandler_.buildChoosingCandidateState(cursor);
        stateCallback(choosing);
      } else if (this.state_ instanceof ShowingCharInfo) {
        const previous = this.state_.previousState;
        stateCallback(previous);
      }
      // number input is already handled.
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
        if (!current) {
          return true;
        }
        const reading = current.reading;
        for (const prefix of invalidPrefixArray) {
          if (reading.startsWith(prefix)) {
            return true;
          }
        }
        const entries: CustomMenuEntry[] = [];
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
          entries
        );
        stateCallback(customMenu);
        return true;
      }
    }

    // Determines whether the input should trigger a page up action. This is
    // true when:
    // - Using JK cursor movement option and 'h' key is pressed, OR
    // - Using HL cursor movement option and 'j' key is pressed
    const isAdditionalPageUp =
      (this.movingCursorOption_ === MovingCursorOption.UseJK &&
        key.ascii === "h") ||
      (this.movingCursorOption_ === MovingCursorOption.UseHL &&
        key.ascii === "j");

    // Determines if the current key input should trigger an additional page
    // down action. This occurs when:
    // - Moving cursor option is set to UseJK and 'l' key is pressed, or
    // - Moving cursor option is set to UseHL and 'k' key is pressed
    const isAdditionalPageDown =
      (this.movingCursorOption_ === MovingCursorOption.UseJK &&
        key.ascii === "l") ||
      (this.movingCursorOption_ === MovingCursorOption.UseHL &&
        key.ascii === "k");

    if (isAdditionalPageUp) {
      this.candidateController_.goToPreviousPage();
    } else if (isAdditionalPageDown) {
      this.candidateController_.goToNextPage();
    } else if (key.name === KeyName.SPACE) {
      this.candidateController_.goToNextPageButFirstWhenAtEnd();
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
    } else if (state instanceof ShowingCharInfo) {
      this.handleChoosingCandidate(prev, state);
    } else if (state instanceof NumberInput) {
      this.handleChoosingCandidate(prev, state);
    } else if (state instanceof Big5) {
      this.handleCustomInput(prev, state);
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
    } else if (state instanceof NumberInput) {
      candidates = state.candidates;
    } else if (state instanceof SelectingFeature) {
      let index = 0;
      for (const item of state.features) {
        const candidate = new Candidate("", index + "", item.name);
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
    } else if (state instanceof ShowingCharInfo) {
      let index = 0;
      for (const item of state.menu) {
        const candidate = new Candidate("", index + "", item);
        candidates.push(candidate);
        index++;
      }
    }

    const shouldUseShiftKeyToSelectCandidate = state instanceof NumberInput;

    const keys: KeyCap[] = [];
    const min = Math.min(this.candidateKeysCount_, this.candidateKeys_.length);
    for (let i = 0; i < min; i++) {
      let key = this.candidateKeys_[i];
      if (shouldUseShiftKeyToSelectCandidate) {
        let displayed = "⇧ " + key;
        let actualKey = key;
        const shiftKeyMapping = new Map<string, string>([
          ["1", "!"],
          ["2", "@"],
          ["3", "#"],
          ["4", "$"],
          ["5", "%"],
          ["6", "^"],
          ["7", "&"],
          ["8", "*"],
          ["9", "("],
          ["0", ")"],
        ]);
        if (shiftKeyMapping.has(key)) {
          actualKey = shiftKeyMapping.get(key)!;
        } else {
          actualKey = key.toUpperCase();
        }
        const keyCap = new KeyCap(displayed, actualKey);
        keys.push(keyCap);
      } else {
        let keyCap = new KeyCap(key, key);
        keys.push(keyCap);
      }
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
    if (state instanceof NumberInput) {
      const composingBuffer = state.composingBuffer;
      this.ui_.setComposingBuffer([new ComposingBufferText(composingBuffer)]);
      this.ui_.setCursorIndex(composingBuffer.length);
    }
    this.ui_.update();
  }

  private handleMarking(prev: InputState, state: Marking) {
    this.updatePreedit(state);
  }

  private handleCustomInput(prev: InputState, state: InputState) {
    this.ui_.reset();
    let composingBuffer = "";
    if (state instanceof Big5) {
      composingBuffer = state.composingBuffer;
    }
    this.ui_.append(new ComposingBufferText(composingBuffer));
    this.ui_.setCursorIndex(composingBuffer.length);
    this.ui_.update();
  }
}
