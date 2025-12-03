/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import {
  BopomofoKeyboardLayout,
  BopomofoReadingBuffer,
  BopomofoSyllable,
} from "../Mandarin";
import { UserOverrideModel } from "./UserOverrideModel";
import {
  Big5,
  ChoosingCandidate,
  Committing,
  Empty,
  EmptyIgnoringPrevious,
  InputState,
  Inputting,
  Marking,
  NotEmpty,
  NumberInput,
  SelectingDictionary,
  SelectingFeature,
} from "./InputState";
import { Key, KeyName } from "./Key";
import { LocalizedStrings } from "./LocalizedStrings";
import { WebLanguageModel } from "./WebLanguageModel";
import * as _ from "lodash";
import {
  Candidate,
  LanguageModel,
  ReadingGrid,
  WalkResult,
} from "../Gramambular2";
import { OverrideType } from "../Gramambular2/ReadingGrid";
import { DictionaryServices } from "./DictionaryServices";
import { CtrlEnterOption } from "./CtrlEnterOption";
import { BopomofoBrailleConverter } from "../BopomofoBraille";
import { NumberInputHelper } from "./InputHelperNumber";

export class ComposedString {
  head: string = "";
  tail: string = "";
  tooltip: string = "";

  constructor(head: string, tail: string, tooltip: string) {
    this.head = head;
    this.tail = tail;
    this.tooltip = tooltip;
  }
}

const kPunctuationListKey = "`"; // Hit the key to bring up the list.
const kPunctuationListUnigramKey = "_punctuation_list";
const kPunctuationKeyPrefix = "_punctuation_";
const kLetterPrefix = "_letter_";
const kCtrlPunctuationPrefix = "_ctrl_punctuation_";
const kHalfPunctuationPrefix = "_half_punctuation_";

const kMinValidMarkingReadingCount = 2;
const kMaxValidMarkingReadingCount = 8;
const kUserOverrideModelCapacity = 500;
const kObservedOverrideHalfLife = 5400.0; // 1.5 hr.

// Unigram whose score is below this shouldn't be put into user override model.
const kNoOverrideThreshold: number = -8.0;
const kJoinSeparator = "-";

function GetKeyboardLayoutName(layout: BopomofoKeyboardLayout): string {
  if (layout === BopomofoKeyboardLayout.ETenLayout) {
    return "ETen";
  } else if (layout === BopomofoKeyboardLayout.HsuLayout) {
    return "Hsu";
  } else if (layout === BopomofoKeyboardLayout.ETen26Layout) {
    return "ETen26";
  } else if (layout === BopomofoKeyboardLayout.HanyuPinyinLayout) {
    return "HanyuPinyin";
  } else if (layout === BopomofoKeyboardLayout.IBMLayout) {
    return "IBM";
  }
  return "Standard";
}

function getTimestamp(): number {
  return new Date().getTime() / 1000;
}

export class KeyHandler {
  private localizedStrings_: LocalizedStrings = new LocalizedStrings();

  public get languageCode(): string {
    return this.localizedStrings_.languageCode;
  }
  public set languageCode(value: string) {
    this.localizedStrings_.languageCode = value;
  }

  private selectPhraseAfterCursorAsCandidate_: boolean = false;
  public get selectPhraseAfterCursorAsCandidate(): boolean {
    return this.selectPhraseAfterCursorAsCandidate_;
  }
  public set selectPhraseAfterCursorAsCandidate(value: boolean) {
    this.selectPhraseAfterCursorAsCandidate_ = value;
  }

  private moveCursorAfterSelection_: boolean = false;
  public get moveCursorAfterSelection(): boolean {
    return this.moveCursorAfterSelection_;
  }
  public set moveCursorAfterSelection(value: boolean) {
    this.moveCursorAfterSelection_ = value;
  }

  private putLowercaseLettersToComposingBuffer_: boolean = false;
  public get putLowercaseLettersToComposingBuffer(): boolean {
    return this.putLowercaseLettersToComposingBuffer_;
  }
  public set putLowercaseLettersToComposingBuffer(value: boolean) {
    this.putLowercaseLettersToComposingBuffer_ = value;
  }

  private escKeyClearsEntireComposingBuffer_: boolean = false;
  public get escKeyClearsEntireComposingBuffer(): boolean {
    return this.escKeyClearsEntireComposingBuffer_;
  }
  public set escKeyClearsEntireComposingBuffer(value: boolean) {
    this.escKeyClearsEntireComposingBuffer_ = value;
  }

  public get keyboardLayout(): BopomofoKeyboardLayout {
    return this.reading_.keyboardLayout;
  }
  public set keyboardLayout(value: BopomofoKeyboardLayout) {
    this.reading_.keyboardLayout = value;
  }

  private traditionalMode_ = false;
  public get traditionalMode(): boolean {
    return this.traditionalMode_;
  }
  public set traditionalMode(flag: boolean) {
    this.traditionalMode_ = flag;
  }

  private halfWidthPunctuation_: boolean = false;
  public get halfWidthPunctuation(): boolean {
    return this.halfWidthPunctuation_;
  }
  public set halfWidthPunctuation(flag: boolean) {
    this.halfWidthPunctuation_ = flag;
  }

  private ctrlEnterOption_: CtrlEnterOption = CtrlEnterOption.None;
  public get ctrlEnterOption(): CtrlEnterOption {
    return this.ctrlEnterOption_;
  }
  public set ctrlEnterOption(flag: CtrlEnterOption) {
    this.ctrlEnterOption_ = flag;
  }

  private repeatedPunctuationToSelectCandidateEnabled_: boolean = false;
  public get repeatedPunctuationToSelectCandidateEnabled(): boolean {
    return this.repeatedPunctuationToSelectCandidateEnabled_;
  }
  public set repeatedPunctuationToSelectCandidateEnabled(flag: boolean) {
    this.repeatedPunctuationToSelectCandidateEnabled_ = flag;
  }

  private languageModel_: LanguageModel;
  private grid_: ReadingGrid;
  private reading_: BopomofoReadingBuffer;
  private latestWalk_: WalkResult | undefined;

  /** The dictionary services. */
  readonly dictionaryServices: DictionaryServices = new DictionaryServices(
    this.localizedStrings_
  );
  public get onOpenUrl(): ((input: string) => void) | undefined {
    return this.dictionaryServices.onOpenUrl;
  }
  public set onOpenUrl(onOpenUrl: ((input: string) => void) | undefined) {
    this.dictionaryServices.onOpenUrl = onOpenUrl;
  }

  private userOverrideModel_: UserOverrideModel = new UserOverrideModel(
    kUserOverrideModelCapacity,
    kObservedOverrideHalfLife
  );

  constructor(languageModel: LanguageModel) {
    this.languageModel_ = languageModel;
    this.reading_ = new BopomofoReadingBuffer(
      BopomofoKeyboardLayout.StandardLayout
    );
    this.grid_ = new ReadingGrid(this.languageModel_);
    this.grid_.readingSeparator = kJoinSeparator;
  }

  handleNumberInput(
    key: Key,
    state: NumberInput,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    if (key.name === KeyName.ESC) {
      stateCallback(new Empty());
      return true;
    }
    if (key.isDeleteKey) {
      let number = state.number;
      if (number.length > 0) {
        number = number.substring(0, number.length - 1);
      } else {
        errorCallback();
        return true;
      }
      const candidates = NumberInputHelper.fillCandidates(
        number,
        this.languageModel_
      );
      const newState = new NumberInput(number, candidates);
      stateCallback(newState);
      return true;
    }
    if (key.ascii >= "0" && key.ascii <= "9") {
      if (state.number.length >= 20) {
        errorCallback();
        return true;
      }
      const number = state.number + key.ascii;
      const candidates = NumberInputHelper.fillCandidates(
        number,
        this.languageModel_
      );
      const newState = new NumberInput(number, candidates);
      stateCallback(newState);
      return true;
    }
    if (key.ascii === ".") {
      if (state.number.indexOf(".") !== -1) {
        errorCallback();
        return true;
      }
      if (state.number.length === 0 || state.number.length > 20) {
        errorCallback();
        return true;
      }
      const number = state.number + key.ascii;
      const candidates = NumberInputHelper.fillCandidates(
        number,
        this.languageModel_
      );
      const newState = new NumberInput(number, candidates);
      stateCallback(newState);
      return true;
    }
    return false;
  }

  handle(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    // From Key's definition, if shiftPressed is true, it can't be a simple key
    // that can be represented by ASCII.
    const simpleAscii = key.ascii;

    // Jump into the menu to select features
    if (simpleAscii === "\\" && key.ctrlPressed) {
      stateCallback(new Empty());
      this.reset();
      stateCallback(
        new SelectingFeature((input) => {
          const lm = this.languageModel_;
          if (lm instanceof WebLanguageModel) {
            return lm.convertMacro(input);
          }
          return input;
        })
      );
      return true;
    }

    if (state instanceof Big5) {
      return this.handleBig5(key, state, stateCallback, errorCallback);
    }

    // Numpad
    if (key.isNumpadKey) {
      // Space hit: see if we should enter the candidate choosing state.
      const maybeNotEmptyState = state as NotEmpty;

      // If current state is *not* NonEmpty, it must be Empty.
      if (maybeNotEmptyState instanceof NotEmpty === false) {
        // We don't need to handle this key.
        return false;
      }

      // First, commit what's already in the composing buffer.
      const inputtingState = this.buildInputtingState();
      // Steal the composingBuffer built by the inputting state.
      const committingState = new Committing(
        inputtingState.composingBuffer + simpleAscii
      );
      stateCallback(committingState);
      this.reset();
      return true;
    }

    // See if it's valid BPMF reading.
    let keyConsumedByReading = false;
    const skipBpmfHandling = key.ctrlPressed;
    if (!skipBpmfHandling && this.reading_.isValidKey(simpleAscii)) {
      this.reading_.combineKey(simpleAscii);
      keyConsumedByReading = true;
      // If asciiChar does not lead to a tone marker, we are done. Tone marker
      // would lead to composing of the reading, which is handled after this.
      if (!this.reading_.hasToneMarker) {
        stateCallback(this.buildInputtingState());
        return true;
      }
    }

    // if (_bpmfReadingBuffer->hasToneMarkerOnly() && _grid->readings().size() > 0 && _grid->cursor() > 0) {
    //     size_t cursor = _grid->cursor() - 1;
    //     const std::string reading = _grid->readings()[cursor];
    //     if (!reading.empty() && reading[0] != '_') {
    //         Formosa::Mandarin::BopomofoReadingBuffer tmpBuffer(_bpmfReadingBuffer->keyboardLayout());
    //         Formosa::Mandarin::BopomofoSyllable syllable =      Formosa::Mandarin::BopomofoSyllable::FromComposedString(reading);
    //         tmpBuffer.setSyllableRemovingTone(syllable);
    //         tmpBuffer.combineKey((char)charCode);
    //         std::string newReading = tmpBuffer.syllable().composedString();
    //         if (_languageModel->hasUnigrams(newReading)) {
    //             _bpmfReadingBuffer->clear();
    //             _grid->deleteReadingBeforeCursor();
    //             _grid->insertReading(newReading);
    //             [self _walk];
    //             InputStateInputting *inputting = (InputStateInputting *)[self buildInputtingState];
    //             stateCallback(inputting);
    //             return YES;
    //         }
    //     }
    // }

    if (
      this.reading_.hasToneMarkerOnly &&
      this.grid_.length > 0 &&
      this.grid_.cursor > 0
    ) {
      const cursor = this.grid_.cursor - 1;
      const reading = this.grid_.readings[cursor];
      if (reading.length > 0 && reading[0] !== "_") {
        const tmpBuffer = new BopomofoReadingBuffer(
          this.reading_.keyboardLayout
        );
        const syllable = BopomofoSyllable.FromComposedString(reading);
        tmpBuffer.setSyllableRemovingTone(syllable);
        tmpBuffer.combineKey(key.ascii);
        const newReading = tmpBuffer.syllable.composedString;
        if (this.languageModel_.hasUnigrams(newReading)) {
          this.reading_.clear();
          this.grid_.deleteReadingBeforeCursor();
          this.grid_.insertReading(newReading);
          this.walk();
          stateCallback(this.buildInputtingState());
          return true;
        }
      }
    }

    // Compose the reading if either there's a tone marker, or if the reading is
    // not empty, and space is pressed.
    const shouldComposeReading =
      (this.reading_.hasToneMarker && !this.reading_.hasToneMarkerOnly) ||
      (!this.reading_.isEmpty && key.name === KeyName.SPACE);

    if (shouldComposeReading) {
      const syllable = this.reading_.syllable.composedString;
      this.reading_.clear();

      if (!this.languageModel_.hasUnigrams(syllable)) {
        errorCallback();
        if (!this.grid_.length) {
          stateCallback(new EmptyIgnoringPrevious());
        } else {
          stateCallback(this.buildInputtingState());
        }
        return true;
      }

      this.grid_.insertReading(syllable);
      this.walk();

      if (!this.traditionalMode_) {
        if (this.latestWalk_) {
          const suggestion = this.userOverrideModel_?.suggest(
            this.latestWalk_,
            this.actualCandidateCursorIndex,
            getTimestamp()
          );

          if (suggestion) {
            const type = suggestion.forceHighScoreOverride
              ? OverrideType.kOverrideValueWithHighScore
              : OverrideType.kOverrideValueWithScoreFromTopUnigram;
            this.grid_.overrideCandidateWithString(
              this.actualCandidateCursorIndex,
              suggestion.candidate,
              type
            );
            this.walk();
          }
        }
      }

      if (this.traditionalMode_) {
        const choosingCandidates = this.buildChoosingCandidateState(0);
        this.reset();
        if (choosingCandidates.candidates.length === 1) {
          const text = choosingCandidates.candidates[0].value;
          const committing = new Committing(text);
          stateCallback(committing);
        } else {
          stateCallback(choosingCandidates);
        }
      } else {
        const inputting = this.buildInputtingState();
        stateCallback(inputting);
      }

      return true;
    }

    // The only possibility for this to be true is that the Bopomofo reading
    // already has a tone marker but the last key is *not* a tone marker key. An
    // example is the sequence "6u" with the Standard layout, which produces "ㄧˊ"
    // but does not compose. Only sequences such as "u6", "6u6", "6u3", or "6u "
    // would compose.
    if (keyConsumedByReading) {
      stateCallback(this.buildInputtingState());
      return true;
    }

    // Shift + Space.
    if (key.name === KeyName.SPACE && key.shiftPressed) {
      if (!this.grid_.length) {
        return false;
      }
      if (!this.reading_.isEmpty) {
        errorCallback();
        return true;
      }

      if (this.putLowercaseLettersToComposingBuffer_) {
        this.grid_.insertReading(" ");
        this.walk();
        const inputtingState = this.buildInputtingState();
        stateCallback(inputtingState);
      } else {
        const inputtingState = this.buildInputtingState();
        // Steal the composingBuffer built by the inputting state.
        let committingState = new Committing(inputtingState.composingBuffer);
        stateCallback(committingState);
        committingState = new Committing(" ");
        stateCallback(committingState);
        this.reset();
      }
      return true;
    }

    // Space hit: see if we should enter the candidate choosing state.
    const maybeNotEmptyState = state as NotEmpty;

    if (
      (key.name === KeyName.SPACE || key.name === KeyName.DOWN) &&
      maybeNotEmptyState instanceof NotEmpty &&
      this.reading_.isEmpty
    ) {
      const originalCursorIndex = this.grid_.cursor;
      if (
        originalCursorIndex === this.grid_.length &&
        this.selectPhraseAfterCursorAsCandidate_ &&
        this.moveCursorAfterSelection_
      ) {
        this.grid_.cursor = originalCursorIndex - 1;
      }

      stateCallback(this.buildChoosingCandidateState(originalCursorIndex));
      return true;
    }

    // Esc hit.
    if (key.name === KeyName.ESC) {
      if (maybeNotEmptyState instanceof NotEmpty === false) {
        return false;
      }

      if (this.escKeyClearsEntireComposingBuffer_) {
        this.reset();
        stateCallback(new EmptyIgnoringPrevious());
        return true;
      }

      if (!this.reading_.isEmpty) {
        this.reading_.clear();
        if (!this.grid_.length) {
          stateCallback(new EmptyIgnoringPrevious());
        } else {
          stateCallback(this.buildInputtingState());
        }
      } else {
        stateCallback(this.buildInputtingState());
      }
      return true;
    }

    // Tab key.
    if (key.name === KeyName.TAB) {
      return this.handleTabKey(
        key.shiftPressed,
        state,
        stateCallback,
        errorCallback
      );
    }

    // Cursor keys.
    if (key.isCursorKey) {
      return this.handleCursorKeys(key, state, stateCallback, errorCallback);
    }

    // Backspace and Del.
    if (key.isDeleteKey) {
      return this.handleDeleteKeys(key, state, stateCallback, errorCallback);
    }

    // Enter.
    if (key.name === KeyName.RETURN) {
      if (maybeNotEmptyState instanceof NotEmpty === false) {
        return false;
      }

      if (!this.reading_.isEmpty) {
        errorCallback();
        stateCallback(this.buildInputtingState());
        return true;
      }

      if (this.traditionalMode_ === false && key.ctrlPressed) {
        if (this.ctrlEnterOption_ === CtrlEnterOption.BpmfReadings) {
          const readings = this.grid_.readings;
          const readingValue = readings.join(kJoinSeparator);

          const committing = new Committing(readingValue);
          stateCallback(committing);
          this.reset();
          return true;
        } else if (this.ctrlEnterOption_ === CtrlEnterOption.HtmlRuby) {
          let composed = "";
          for (const node of this.latestWalk_?.nodes ?? []) {
            let reading = node.reading;
            reading = reading.replace(kJoinSeparator, " ");
            const value = node.value;
            if (reading[0] === "_") {
              composed += value;
            } else {
              composed += "<ruby>";
              composed += value;
              composed += "<rp>(</rp><rt>" + reading + "</rt><rp>)</rp>";
              composed += "</ruby>";
            }
          }
          const committing = new Committing(composed);
          stateCallback(committing);
          this.reset();
          return true;
        } else if (this.ctrlEnterOption_ === CtrlEnterOption.BopomofoBraille) {
          let composed = "";

          for (const node of this.latestWalk_?.nodes ?? []) {
            let reading = node.reading;
            reading = reading.replace(kJoinSeparator, " ");
            const value = node.value;
            if (reading[0] === "_") {
              composed += BopomofoBrailleConverter.convertBpmfToBraille(value);
            } else {
              const components = reading.split(kJoinSeparator);
              for (const component of components) {
                composed +=
                  BopomofoBrailleConverter.convertBpmfToBraille(component);
              }
            }
          }

          const committing = new Committing(composed);
          stateCallback(committing);
          this.reset();
          return true;
        } else if (this.ctrlEnterOption_ === CtrlEnterOption.HanyuPinyin) {
          const pinyinComponents = [];
          for (const node of this.latestWalk_?.nodes ?? []) {
            const reading = node.reading;
            for (const component of reading.split(kJoinSeparator)) {
              const syllable = BopomofoSyllable.FromComposedString(component);
              const pinyin = syllable.HanyuPinyinString(false, false);
              if (pinyin.length > 0) {
                pinyinComponents.push(pinyin);
              } else {
                pinyinComponents.push(node.value);
              }
            }
          }
          const composed = pinyinComponents.join(" ");
          const committing = new Committing(composed);
          stateCallback(committing);
          this.reset();
          return true;
        }

        return false;
      }

      // See if we are in Marking state, and, if a valid mark, accept it.
      if (state instanceof Marking) {
        const marking = state as Marking;
        if (marking.acceptable) {
          if (this.languageModel_ instanceof WebLanguageModel) {
            (this.languageModel_ as WebLanguageModel).addUserPhrase(
              marking.reading,
              marking.markedText
            );
          }
          stateCallback(this.buildInputtingState());
        } else {
          errorCallback();
          stateCallback(
            this.buildMarkingState(marking.markStartGridCursorIndex)
          );
        }
        return true;
      }

      const inputtingState = this.buildInputtingState();
      // Steal the composingBuffer built by the inputting state.
      const committingState = new Committing(inputtingState.composingBuffer);
      stateCallback(committingState);
      this.reset();
      return true;
    }

    if (key.ascii === "?" && state instanceof Marking) {
      const phrase = state.markedText;
      const newState = new SelectingDictionary(
        state,
        phrase,
        0,
        this.dictionaryServices.buildMenu(phrase)
      );
      stateCallback(newState);
      return true;
    }

    // Punctuation key: backtick or grave accent.
    if (
      simpleAscii === kPunctuationListKey &&
      this.languageModel_.hasUnigrams(kPunctuationListUnigramKey)
    ) {
      if (this.reading_.isEmpty) {
        this.grid_.insertReading(kPunctuationListUnigramKey);
        this.walk();
        const originalCursorIndex = this.grid_.cursor;
        if (this.selectPhraseAfterCursorAsCandidate_) {
          this.grid_.cursor = originalCursorIndex - 1;
        }
        const choosingCandidateState =
          this.buildChoosingCandidateState(originalCursorIndex);
        stateCallback(choosingCandidateState);
      } else {
        // Punctuation ignored if a bopomofo reading is active..
        errorCallback();
      }
      return true;
    }

    if (simpleAscii !== "") {
      // let chrStr = key.ascii;
      let unigram = "";

      let prefix = kPunctuationKeyPrefix;
      if (key.ctrlPressed) {
        prefix = kCtrlPunctuationPrefix;
      } else if (this.halfWidthPunctuation_) {
        prefix = kHalfPunctuationPrefix;
      }

      // Bopomofo layout-specific punctuation handling.
      unigram =
        prefix +
        GetKeyboardLayoutName(this.reading_.keyboardLayout) +
        "_" +
        simpleAscii;
      if (
        this.handlePunctuation(
          unigram,
          key,
          state,
          stateCallback,
          errorCallback
        )
      ) {
        return true;
      }

      // Not handled, try generic punctuations.
      unigram = prefix + simpleAscii;
      if (
        this.handlePunctuation(
          unigram,
          key,
          state,
          stateCallback,
          errorCallback
        )
      ) {
        return true;
      }

      // Upper case letters.
      if (
        simpleAscii.length === 1 &&
        simpleAscii >= "A" &&
        simpleAscii <= "Z"
      ) {
        if (this.putLowercaseLettersToComposingBuffer_) {
          unigram = kLetterPrefix + simpleAscii;

          // Ignore return value, since we always return true below.
          this.handlePunctuation(
            unigram,
            key,
            state,
            stateCallback,
            errorCallback
          );
        } else {
          // If current state is *not* NonEmpty, it must be Empty.
          if (maybeNotEmptyState instanceof NotEmpty === false) {
            // We don't need to handle this key.
            return false;
          }

          // First, commit what's already in the composing buffer.
          const inputtingState = this.buildInputtingState();
          // Steal the composingBuffer built by the inputting state.
          const committingState = new Committing(
            inputtingState.composingBuffer + simpleAscii
          );
          stateCallback(committingState);
          this.reset();
        }
        return true;
      }
    }

    // Do not handle other keys in Marking state.
    if (state instanceof Marking) {
      return true;
    }

    // No key is handled. Refresh and consume the key.
    if (maybeNotEmptyState instanceof NotEmpty) {
      var shouldPromptAlert = true;
      if (key.ctrlPressed) {
        shouldPromptAlert = false;
      }
      if (key.ascii === "Shift") {
        shouldPromptAlert = false;
      }

      if (shouldPromptAlert) {
        errorCallback();
      }
      stateCallback(this.buildInputtingState());
      return true;
    }

    return false;
  }

  candidateSelected(
    candidate: Candidate,
    originalCursorIndex: number,
    stateCallback: (state: InputState) => void
  ): void {
    if (this.traditionalMode_) {
      this.reset();
      stateCallback(new Committing(candidate.value));
      return;
    }

    this.pinNode(candidate, originalCursorIndex);
    stateCallback(this.buildInputtingState());
  }

  public candidatePanelCancelled(
    originalCursorIndex: number,
    stateCallback: (state: InputState) => void
  ): void {
    if (this.traditionalMode_) {
      this.reset();
      stateCallback(new EmptyIgnoringPrevious());
      return;
    }
    this.grid_.cursor = originalCursorIndex;
    stateCallback(this.buildInputtingState());
  }

  public handlePunctuationKeyInCandidatePanelForTraditionalMode(
    key: Key,
    defaultCandidate: string,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    const chrStr: string = key.ascii;
    const customPunctuation =
      kPunctuationKeyPrefix +
      GetKeyboardLayoutName(this.reading_.keyboardLayout) +
      "_" +
      chrStr;
    const punctuation = kPunctuationKeyPrefix + chrStr;
    let shouldAutoSelectCandidate =
      this.reading_.isValidKey(chrStr) ||
      this.languageModel_.hasUnigrams(customPunctuation) ||
      this.languageModel_.hasUnigrams(punctuation);
    if (!shouldAutoSelectCandidate) {
      if (chrStr.length === 1 && chrStr >= "A" && chrStr <= "Z") {
        const letter = kLetterPrefix + chrStr;
        if (this.languageModel_.hasUnigrams(letter)) {
          shouldAutoSelectCandidate = true;
        }
      }
    }
    if (shouldAutoSelectCandidate) {
      stateCallback(new Committing(defaultCandidate));
      this.reset();
      this.handle(key, new Empty(), stateCallback, errorCallback);
      return true;
    }

    errorCallback();
    return false;
  }

  public reset(): void {
    this.reading_.clear();
    this.grid_.clear();
    this.latestWalk_ = undefined;
  }

  public get gridLength(): number {
    return this.grid_.length;
  }

  public get cursor(): number {
    return this.grid_.cursor;
  }

  public set cursor(index: number) {
    this.grid_.cursor = index;
  }

  private getComposedString(builderCursor: number): ComposedString {
    // To construct an Inputting state, we need to first retrieve the entire
    // composing buffer from the current grid, then split the composed string into
    // head and tail, so that we can insert the current reading (if not-empty)
    // between them.
    //
    // We'll also need to compute the UTF-8 cursor index. The idea here is we use
    // a "running" index that will eventually catch the cursor index in the
    // builder. The tricky part is that if the spanning length of the node that
    // the cursor is at does not agree with the actual codepoint count of the
    // node's value, we'll need to move the cursor at the end of the node to avoid
    // confusions.

    let runningCursor: number = 0; // spanning-length-based, like the builder cursor
    let composed: string = "";
    let composedCursor: number = 0; // UTF-8 (so "byte") cursor per fcitx5 requirement.

    let tooltip = "";

    for (const node of this.latestWalk_?.nodes ?? []) {
      const value = node.value;
      composed += value;

      // No work if runningCursor has already caught up with builderCursor.
      if (runningCursor === builderCursor) {
        continue;
      }
      const spanningLength = node.spanningLength;
      // Simple case: if the running cursor is behind, add the spanning length.
      if (runningCursor + spanningLength <= builderCursor) {
        composedCursor += value.length;
        runningCursor += spanningLength;
        continue;
      }

      const distance = builderCursor - runningCursor;
      const u32Value = _.toArray(value);
      const cpLen = Math.min(distance, u32Value.length);
      const actualString = _.join(u32Value.slice(0, cpLen), "");
      composedCursor += actualString.length;
      runningCursor += distance;

      // Create a tooltip to warn the user that their cursor is between two
      // readings (syllables) even if the cursor is not in the middle of a
      // composed string due to its being shorter than the number of readings.
      if (u32Value.length !== spanningLength) {
        // builderCursor is guaranteed to be > 0. If it was 0, we wouldn't even
        // reach here due to runningCursor having already "caught up" with
        // builderCursor. It is also guaranteed to be less than the size of the
        // builder's readings for the same reason: runningCursor would have
        // already caught up.
        const prevReading = this.grid_.readings[builderCursor - 1];
        const nextReading = this.grid_.readings[builderCursor];
        tooltip = this.localizedStrings_.cursorIsBetweenSyllables(
          prevReading,
          nextReading
        );
      }
    }

    const head = composed.substring(0, composedCursor);
    const tail = composed.substring(composedCursor, composed.length);
    return new ComposedString(head, tail, tooltip);
  }

  private handleTabKey(
    // key: Key,
    shiftPressed: boolean,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    if (this.reading_.isEmpty && (this.latestWalk_?.nodes ?? []).length === 0) {
      return false;
    }

    if (state instanceof Inputting === false) {
      errorCallback();
      return true;
    }

    if (!this.reading_.isEmpty) {
      errorCallback();
      return true;
    }

    const candidates = this.buildChoosingCandidateState(0).candidates;
    if (!candidates.length) {
      errorCallback();
      return true;
    }

    const cursorIndex = this.actualCandidateCursorIndex;
    const result = this.latestWalk_?.findNodeAt(cursorIndex);
    if (result === undefined) {
      errorCallback();
      return true;
    }

    const currentNode = result[0];
    if (currentNode === undefined) {
      errorCallback();
      return true;
    }

    let currentIndex = 0;
    if (!currentNode.isOverridden) {
      // If the user never selects a candidate for the node, we start from the
      // first candidate, so the user has a chance to use the unigram with two or
      // more characters when type the tab key for the first time.
      //
      // In other words, if a user type two BPMF readings, but the score of seeing
      // them as two unigrams is higher than a phrase with two characters, the
      // user can just use the longer phrase by typing the tab key.
      if (
        candidates[0].reading === currentNode.reading &&
        candidates[0].value === currentNode.value
      ) {
        // if (candidates[0].reading === currentNode.reading &&
        //     candidates[0].value === currentNode.value) {
        // If the first candidate is the value of the current node, we use next
        // one.
        if (shiftPressed) {
          currentIndex = candidates.length - 1;
        } else {
          currentIndex = 1;
        }
      }
    } else {
      for (const candidate of candidates) {
        if (
          candidate.reading === currentNode.reading &&
          candidate.value === currentNode.value
        ) {
          if (shiftPressed) {
            currentIndex === 0
              ? (currentIndex = candidates.length - 1)
              : currentIndex--;
          } else {
            currentIndex++;
          }
          break;
        }
        currentIndex++;
      }
    }

    if (currentIndex >= candidates.length) {
      currentIndex = 0;
    }

    this.pinNode(
      candidates[currentIndex],
      this.grid_.cursor,
      /*useMoveCursorAfterSelectionSetting=*/ false
    );
    stateCallback(this.buildInputtingState());
    return true;
  }

  private handleCursorKeys(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    if (
      state instanceof Inputting === false &&
      state instanceof Marking === false
    ) {
      return false;
    }

    let markBeginCursorIndex = this.grid_.cursor;
    if (state instanceof Marking) {
      markBeginCursorIndex = (state as Marking).markStartGridCursorIndex;
    }

    if (!this.reading_.isEmpty) {
      errorCallback();
      stateCallback(this.buildInputtingState());
      return true;
    }

    let isValidMove = false;
    if (key.name === KeyName.LEFT || key.ascii === "b") {
      if (this.grid_.cursor > 0) {
        this.grid_.cursor -= 1;
        isValidMove = true;
      }
    } else if (key.name === KeyName.RIGHT || key.ascii === "f") {
      if (this.grid_.cursor < this.grid_.length) {
        this.grid_.cursor += 1;
        isValidMove = true;
      }
    } else if (key.name === KeyName.HOME || key.ascii === "a") {
      this.grid_.cursor = 0;
      isValidMove = true;
    } else if (key.name === KeyName.END || key.ascii === "e") {
      this.grid_.cursor = this.grid_.length;
      isValidMove = true;
    }
    if (!isValidMove) {
      errorCallback();
    }

    if (key.shiftPressed && this.grid_.cursor !== markBeginCursorIndex) {
      stateCallback(this.buildMarkingState(markBeginCursorIndex));
    } else {
      stateCallback(this.buildInputtingState());
    }
    return true;
  }

  private handleDeleteKeys(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    if (state instanceof NotEmpty === false) {
      return false;
    }

    if (this.reading_.hasToneMarkerOnly) {
      this.reading_.clear();
    } else if (this.reading_.isEmpty) {
      let isValidDelete = false;

      if (
        (key.name === KeyName.BACKSPACE || key.ascii === "h") &&
        this.grid_.cursor > 0
      ) {
        this.grid_.deleteReadingBeforeCursor();
        isValidDelete = true;
      } else if (
        (key.name === KeyName.DELETE || key.ascii === "d") &&
        this.grid_.cursor < this.grid_.length
      ) {
        this.grid_.deleteReadingAfterCursor();
        isValidDelete = true;
      }
      if (!isValidDelete) {
        errorCallback();
        stateCallback(this.buildInputtingState());
        return true;
      }
      this.walk();
    } else {
      if (key.name === KeyName.BACKSPACE) {
        this.reading_.backspace();
      } else {
        // Del not supported when bopomofo reading is active.
        errorCallback();
      }
    }

    if (this.reading_.isEmpty && this.grid_.length === 0) {
      // Cancel the previous input state if everything is empty now.
      stateCallback(new EmptyIgnoringPrevious());
    } else {
      stateCallback(this.buildInputtingState());
    }
    return true;
  }

  private handlePunctuation(
    punctuationUnigramKey: string,
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    if (!this.languageModel_.hasUnigrams(punctuationUnigramKey)) {
      return false;
    }

    if (this.repeatedPunctuationToSelectCandidateEnabled) {
      const prefixCursorIndex = this.grid_.cursor;
      const actualPrefixCursorIndex =
        prefixCursorIndex > 0 ? prefixCursorIndex - 1 : 0;
      const result = this.latestWalk_?.findNodeAt(actualPrefixCursorIndex);
      const currentNode = result ? result[0] : undefined;

      if (currentNode && currentNode.reading === punctuationUnigramKey) {
        const candidates = this.grid_.candidatesAt(actualPrefixCursorIndex);
        if (candidates.length > 1) {
          if (this.selectPhraseAfterCursorAsCandidate) {
            this.grid_.cursor = actualPrefixCursorIndex;
          }
          this.handleTabKey(false, state, stateCallback, errorCallback);
          this.grid_.cursor = prefixCursorIndex;
          stateCallback(this.buildInputtingState());
          return true;
        }
      }
    }

    if (!this.reading_.isEmpty) {
      errorCallback();
      stateCallback(this.buildInputtingState());
      return true;
    }

    this.grid_.insertReading(punctuationUnigramKey);
    this.walk();

    if (this.traditionalMode_ && this.reading_.isEmpty) {
      const candidateState = this.buildChoosingCandidateState(0);
      this.reset();
      if (candidateState.candidates.length === 1) {
        const text = candidateState.candidates[0].value;
        stateCallback(new Committing(text));
      } else {
        stateCallback(candidateState);
      }
    } else {
      stateCallback(this.buildInputtingState());
    }

    return true;
  }

  public buildChoosingCandidateState(
    originalCursorIndex: number
  ): ChoosingCandidate {
    const candidates = this.grid_.candidatesAt(this.actualCandidateCursorIndex);
    const inputting = this.buildInputtingState();

    return new ChoosingCandidate(
      inputting.composingBuffer,
      inputting.cursorIndex,
      candidates,
      originalCursorIndex
    );
  }

  private handleBig5(
    key: Key,
    state: Big5,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    if (key.name === KeyName.ESC) {
      stateCallback(new Empty());
      return true;
    }
    if (key.isDeleteKey) {
      let code = state.code;
      if (code.length > 0) {
        code = code.substring(0, code.length - 1);
      } else {
        errorCallback();
        return true;
      }
      const newState = new Big5(code);
      stateCallback(newState);
      return true;
    }
    if (
      (key.ascii >= "0" && key.ascii <= "9") ||
      (key.ascii >= "a" && key.ascii <= "f")
    ) {
      const appended = state.code + key.ascii;
      if (appended.length === 4) {
        const bytes = [];
        for (let i = 0; i < 4; i++) {
          const char = appended.charCodeAt(i);
          if (char >= 48 && char <= 57) {
            bytes.push(char - 48);
          } else if (char >= 97 && char <= 122) {
            bytes.push(char - 97 + 10);
          }
        }
        const textDecoder = new TextDecoder("big5-hkscs");
        const uint8array = new Uint8Array([
          (bytes[0] << 4) | bytes[1],
          (bytes[2] << 4) | bytes[3],
        ]);
        const result = textDecoder.decode(uint8array);
        if (!result || result.length !== 1 || result.charCodeAt(0) < 32) {
          errorCallback();
          stateCallback(new Empty());
        } else {
          stateCallback(new Committing(result));
          stateCallback(new Empty());
        }
      } else {
        const newState = new Big5(appended);
        stateCallback(newState);
      }
    } else {
      errorCallback();
    }

    return true;
  }

  public buildInputtingState(): Inputting {
    const composedString = this.getComposedString(this.grid_.cursor);

    const head = composedString.head;
    const reading = this.reading_.composedString;
    const tail = composedString.tail;

    const composingBuffer = head + reading + tail;
    const cursorIndex = head.length + reading.length;
    return new Inputting(composingBuffer, cursorIndex, composedString.tooltip);
  }

  private buildMarkingState(beginCursorIndex: number): Marking {
    // We simply build two composed strings and use the delta between the shorter
    // and the longer one as the marked text.
    let from = this.getComposedString(beginCursorIndex);
    let to = this.getComposedString(this.grid_.cursor);
    const composedStringCursorIndex = to.head.length;
    const composed = to.head + to.tail;
    let fromIndex = beginCursorIndex;
    let toIndex = this.grid_.cursor;

    if (beginCursorIndex > this.grid_.cursor) {
      [from, to] = [to, from];
      [fromIndex, toIndex] = [toIndex, fromIndex];
    }

    // Now from is shorter and to is longer. The marked text is just the delta.
    const head = from.head;
    const marked = to.head.substring(from.head.length);
    const tail = to.tail;

    // Collect the readings.
    const readings = this.grid_.readings.slice(fromIndex, toIndex);

    const readingUiText = _.join(readings, " "); // What the user sees.
    const readingValue = _.join(readings, "-"); // What is used for adding a user phrase.

    let isValid = false;
    let status = "";
    // Validate the marking.
    if (readings.length < kMinValidMarkingReadingCount) {
      status = this.localizedStrings_.syllablesRequired(
        kMinValidMarkingReadingCount
      );
    } else if (readings.length > kMaxValidMarkingReadingCount) {
      status = this.localizedStrings_.syllableMaximum(
        kMaxValidMarkingReadingCount
      );
    } else if (MarkedPhraseExists(this.languageModel_, readingValue, marked)) {
      status = this.localizedStrings_.phraseAlreadyExists();
    } else {
      status = this.localizedStrings_.pressEnterToAddThePhrase();
      isValid = true;
    }

    const tooltip = this.localizedStrings_.markedWithSyllablesAndStatus(
      marked,
      readingUiText,
      status
    );

    return new Marking(
      composed,
      composedStringCursorIndex,
      tooltip,
      beginCursorIndex,
      head,
      marked,
      tail,
      readingValue,
      isValid
    );
  }

  private get actualCandidateCursorIndex(): number {
    const cursor = this.grid_.cursor;

    // If the cursor is at the end, always return cursor - 1. Even though
    // ReadingGrid already handles this edge case, we want to use this value
    // consistently. UserOverrideModel also requires the cursor to be this
    // correct value.
    if (cursor === this.grid_.length && cursor > 0) {
      return cursor - 1;
    }

    // ReadingGrid already makes the assumption that the cursor is always *at*
    // the reading location, and when selectPhraseAfterCursorAsCandidate_ is true
    // we don't need to do anything. Rather, it's when the flag is false (the
    // default value), that we want to decrement the cursor by one.
    if (!this.selectPhraseAfterCursorAsCandidate_ && cursor > 0) {
      return cursor - 1;
    }
    return cursor;
  }

  private pinNode(
    candidate: Candidate,
    originalCursorIndex: number,
    useMoveCursorAfterSelectionSetting: boolean = true
  ): void {
    const actualCursor = this.actualCandidateCursorIndex;
    const gridCandidate = new Candidate(
      candidate.reading,
      candidate.value,
      candidate.displayedText
    );
    if (!this.grid_.overrideCandidate(actualCursor, gridCandidate)) {
      return;
    }

    const prevWalk = this.latestWalk_;
    this.walk();

    // Update the user override model if warranted.
    const latestWalk_ = this.latestWalk_;
    if (latestWalk_ === undefined) {
      return;
    }

    const result = latestWalk_.findNodeAt(actualCursor);
    const currentNode = result[0];
    const accumulatedCursor = result[1];
    if (currentNode === undefined) {
      return;
    }

    if (currentNode.currentUnigram.score > kNoOverrideThreshold) {
      this.userOverrideModel_.observe(
        prevWalk,
        this.latestWalk_,
        actualCursor,
        getTimestamp()
      );
    }

    if (useMoveCursorAfterSelectionSetting && this.moveCursorAfterSelection_) {
      this.grid_.cursor = accumulatedCursor;
    } else {
      this.grid_.cursor = originalCursorIndex;
    }
  }

  private walk() {
    this.latestWalk_ = this.grid_.walk();
  }

  addUserPhrase(reading: string, phrase: string) {
    if (this.languageModel_ instanceof WebLanguageModel) {
      (this.languageModel_ as WebLanguageModel).addUserPhrase(reading, phrase);
    }
  }

  addExcludedPhrase(reading: string, phrase: string) {
    if (this.languageModel_ instanceof WebLanguageModel) {
      (this.languageModel_ as WebLanguageModel).addExcludedPhrase(
        reading,
        phrase
      );
    }
  }
}

function MarkedPhraseExists(
  languageModel_: LanguageModel,
  readingValue: string,
  marked: string
) {
  const phrases = languageModel_.getUnigrams(readingValue);
  for (const unigram of phrases) {
    if (unigram.value === marked) {
      return true;
    }
  }
  return false;
}
