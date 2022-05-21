import {
  LanguageModel,
  BlockReadingBuilder,
  NodeAnchor,
  Walker,
} from "../Gramambular";
import { BopomofoKeyboardLayout, BopomofoReadingBuffer } from "../Mandarin";
import { UserOverrideModel } from "./UserOverrideModel";
import {
  ChoosingCandidate,
  Committing,
  EmptyIgnoringPrevious,
  InputState,
  Inputting,
  Marking,
  NotEmpty,
} from "./InputState";

import * as _ from "lodash";
import { Key, KeyName } from "./Key";

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
const kCtrlPunctuationKeyPrefix = "_ctrl_punctuation_";
const kLetterPrefix = "_letter_";

const kMinValidMarkingReadingCount = 2;
const kMaxValidMarkingReadingCount = 6;
const kUserOverrideModelCapacity = 500;
const kObservedOverrideHalfLife = 5400.0; // 1.5 hr.

const kComposingBufferSize: number = 10;
// Unigram whose score is below this shouldn't be put into user override model.
const kNoOverrideThreshold: number = -8.0;
const kEpsilon = 0.000001;
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

function FindHighestScore(nodeAnchors: NodeAnchor[], epsilon: number): number {
  let highestScore = 0.0;
  for (let anchor of nodeAnchors) {
    if (anchor.node === undefined) {
      continue;
    }
    let score = anchor.node!.highestUnigramScore;
    if (score > highestScore) {
      highestScore = score;
    }
  }
  return highestScore + epsilon;
}

export class KeyHandler {
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

  private languageModel_: LanguageModel;
  private reading_: BopomofoReadingBuffer;
  private builder_: BlockReadingBuilder;
  private walkedNodes_: NodeAnchor[] = [];
  private userOverrideModel_: UserOverrideModel = new UserOverrideModel(
    kUserOverrideModelCapacity,
    kObservedOverrideHalfLife
  );

  constructor(languageModel: LanguageModel) {
    this.languageModel_ = languageModel;
    this.reading_ = new BopomofoReadingBuffer(
      BopomofoKeyboardLayout.StandardLayout
    );
    this.builder_ = new BlockReadingBuilder(this.languageModel_);
    this.builder_.joinSeparator = kJoinSeparator;
  }

  handle(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    // From Key's definition, if shiftPressed is true, it can't be a simple key
    // that can be represented by ASCII.
    let simpleAscii = key.ascii;
    if (
      simpleAscii === "Shift" ||
      simpleAscii === "Meta" ||
      simpleAscii === "Alt"
    ) {
      return false;
    }
    // See if it's valid BPMF reading.
    let keyConsumedByReading = false;
    if (this.reading_.isValidKey(simpleAscii)) {
      this.reading_.combineKey(simpleAscii);
      keyConsumedByReading = true;
      // If asciiChar does not lead to a tone marker, we are done. Tone marker
      // would lead to composing of the reading, which is handled after this.
      if (!this.reading_.hasToneMarker) {
        stateCallback(this.buildInputtingState());
        return true;
      }
    }

    // Compose the reading if either there's a tone marker, or if the reading is
    // not empty, and space is pressed.
    let shouldComposeReading =
      (this.reading_.hasToneMarker && !this.reading_.hasToneMarkerOnly) ||
      (!this.reading_.isEmpty && key.name === KeyName.SPACE);

    if (shouldComposeReading) {
      let syllable = this.reading_.syllable.composedString;
      this.reading_.clear();

      if (!this.languageModel_.hasUnigramsForKey(syllable)) {
        errorCallback();
        if (!this.builder_.length) {
          stateCallback(new EmptyIgnoringPrevious());
        } else {
          stateCallback(this.buildInputtingState());
        }
        return true;
      }

      this.builder_.insertReadingAtCursor(syllable);
      let evictedText = this.popEvictedTextAndWalk();

      let overrideValue = this.userOverrideModel_?.suggest(
        this.walkedNodes_,
        this.builder_.cursorIndex,
        new Date().getTime()
      );
      if (overrideValue != null && overrideValue?.length != 0) {
        let cursorIndex = this.actualCandidateCursorIndex;
        let nodes = this.builder_.grid.nodesCrossingOrEndingAt(cursorIndex);
        let highestScore = FindHighestScore(nodes, kEpsilon);
        this.builder_.grid.overrideNodeScoreForSelectedCandidate(
          cursorIndex,
          overrideValue,
          highestScore
        );
      }

      let inputtingState = this.buildInputtingState();
      inputtingState.evictedText = evictedText;
      stateCallback(inputtingState);
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
      if (this.putLowercaseLettersToComposingBuffer_) {
        this.builder_.insertReadingAtCursor(" ");
        let evictedText = this.popEvictedTextAndWalk();
        let inputtingState = this.buildInputtingState();
        inputtingState.evictedText = evictedText;
        stateCallback(inputtingState);
      } else {
        if (this.builder_.length) {
          let inputtingState = this.buildInputtingState();
          // Steal the composingBuffer built by the inputting state.
          let committingState = new Committing(inputtingState.composingBuffer);
          stateCallback(committingState);
        }
        let committingState = new Committing(" ");
        stateCallback(committingState);
        this.reset();
      }
      return true;
    }

    // Space hit: see if we should enter the candidate choosing state.
    let maybeNotEmptyState = state as NotEmpty;

    if (
      key.name === KeyName.SPACE &&
      maybeNotEmptyState instanceof NotEmpty &&
      this.reading_.isEmpty
    ) {
      stateCallback(this.buildChoosingCandidateState(maybeNotEmptyState));
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
        if (!this.builder_.length) {
          stateCallback(new EmptyIgnoringPrevious());
        } else {
          stateCallback(this.buildInputtingState());
        }
      } else {
        stateCallback(this.buildInputtingState());
      }
      return true;
    }

    // Cursor keys.
    if (key.isCursorKeys) {
      return this.handleCursorKeys(key, state, stateCallback, errorCallback);
    }

    // Backspace and Del.
    if (key.isDeleteKeys) {
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

      // See if we are in Marking state, and, if a valid mark, accept it.
      if (state instanceof Marking) {
        let marking = state as Marking;
        if (marking.acceptable) {
          // TODO: Add phrase here.
          // this.userPhraseAdder_.addUserPhrase(marking.reading, marking.markedText);
          // onAddNewPhrase_(marking.markedText);
          stateCallback(this.buildInputtingState());
        } else {
          errorCallback();
          stateCallback(
            this.buildMarkingState(marking.markStartGridCursorIndex)
          );
        }
        return true;
      }

      let inputtingState = this.buildInputtingState();
      // Steal the composingBuffer built by the inputting state.
      let committingState = new Committing(inputtingState.composingBuffer);
      stateCallback(committingState);
      this.reset();
      return true;
    }

    // Punctuation key: backtick or grave accent.
    if (
      simpleAscii === kPunctuationListKey &&
      this.languageModel_.hasUnigramsForKey(kPunctuationListUnigramKey)
    ) {
      if (this.reading_.isEmpty) {
        this.builder_.insertReadingAtCursor(kPunctuationListUnigramKey);

        let evictedText = this.popEvictedTextAndWalk();

        let inputtingState = this.buildInputtingState();
        inputtingState.evictedText = evictedText;
        let choosingCandidateState =
          this.buildChoosingCandidateState(inputtingState);
        stateCallback(inputtingState);
        stateCallback(choosingCandidateState);
      } else {
        // Punctuation ignored if a bopomofo reading is active..
        errorCallback();
      }
      return true;
    }

    if (key.ascii != "") {
      let chrStr = key.ascii;
      let unigram = "";
      if (key.ctrlPressed) {
        unigram = kCtrlPunctuationKeyPrefix + chrStr;
        if (this.handlePunctuation(unigram, stateCallback, errorCallback)) {
          return true;
        }
        return false;
      }

      // Bopomofo layout-specific punctuation handling.
      unigram =
        kPunctuationKeyPrefix +
        GetKeyboardLayoutName(this.reading_.keyboardLayout) +
        "_" +
        chrStr;
      if (this.handlePunctuation(unigram, stateCallback, errorCallback)) {
        return true;
      }

      // Not handled, try generic punctuations.
      unigram = kPunctuationKeyPrefix + chrStr;
      if (this.handlePunctuation(unigram, stateCallback, errorCallback)) {
        return true;
      }

      // Upper case letters.
      if (
        simpleAscii.length === 1 &&
        simpleAscii >= "A" &&
        simpleAscii <= "Z"
      ) {
        if (this.putLowercaseLettersToComposingBuffer_) {
          unigram = kLetterPrefix + chrStr;

          // Ignore return value, since we always return true below.
          this.handlePunctuation(unigram, stateCallback, errorCallback);
        } else {
          // If current state is *not* NonEmpty, it must be Empty.
          if (maybeNotEmptyState instanceof NotEmpty === false) {
            // We don't need to handle this key.
            return false;
          }

          // First, commit what's already in the composing buffer.
          let inputtingState = this.buildInputtingState();
          // Steal the composingBuffer built by the inputting state.
          let committingState = new Committing(inputtingState.composingBuffer);
          stateCallback(committingState);

          // Then we commit that single character.
          stateCallback(new Committing(chrStr));
          this.reset();
        }
        return true;
      }
    }

    // No key is handled. Refresh and consume the key.
    if (maybeNotEmptyState instanceof NotEmpty) {
      errorCallback();
      stateCallback(this.buildInputtingState());
      return true;
    }

    return false;
  }

  candidateSelected(
    candidate: string,
    stateCallback: (state: InputState) => void
  ): void {
    this.pinNode(candidate);
    stateCallback(this.buildInputtingState());
  }

  candidatePanelCancelled(stateCallback: (state: InputState) => void): void {
    stateCallback(this.buildInputtingState());
  }

  reset(): void {
    this.reading_.clear();
    this.builder_.clear();
    this.walkedNodes_ = [];
  }

  getComposedString(builderCursor: number): ComposedString {
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

    for (let anchor of this.walkedNodes_) {
      let node = anchor.node;
      if (node === undefined) {
        continue;
      }
      let value = node.currentKeyValue.value;
      composed += value;

      // No work if runningCursor has already caught up with builderCursor.
      if (runningCursor === builderCursor) {
        continue;
      }
      let spanningLength = anchor.spanningLength;
      // Simple case: if the running cursor is behind, add the spanning length.
      if (runningCursor + spanningLength <= builderCursor) {
        composedCursor += value.length;
        runningCursor += spanningLength;
        continue;
      }

      let distance = builderCursor - runningCursor;
      let u32Value = _.toArray(value);
      let cpLen = Math.min(distance, u32Value.length);
      let actualString = _.join(u32Value.slice(0, cpLen), "");
      composedCursor += actualString.length;
      runningCursor += distance;

      // Create a tooltip to warn the user that their cursor is between two
      // readings (syllables) even if the cursor is not in the middle of a
      // composed string due to its being shorter than the number of readings.
      if (actualString.length < spanningLength) {
        // builderCursor is guaranteed to be > 0. If it was 0, we wouldn't even
        // reach here due to runningCursor having already "caught up" with
        // builderCursor. It is also guaranteed to be less than the size of the
        // builder's readings for the same reason: runningCursor would have
        // already caught up.
        let prevReading = this.builder_.readings[builderCursor - 1];
        let nextReading = this.builder_.readings[builderCursor];
        tooltip =
          "Cursor is between syllables " +
          prevReading +
          " and " +
          nextReading +
          ".";
      }
    }

    let head = composed.substring(0, composedCursor);
    let tail = composed.substring(composedCursor, composed.length);
    return new ComposedString(head, tail, tooltip);
  }

  handleCursorKeys(
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

    let markBeginCursorIndex = this.builder_.cursorIndex;
    if (state instanceof Marking) {
      markBeginCursorIndex = (state as Marking).markStartGridCursorIndex;
    }

    if (!this.reading_.isEmpty) {
      errorCallback();
      stateCallback(this.buildInputtingState());
      return true;
    }

    let isValidMove = false;
    switch (key.name) {
      case KeyName.LEFT:
        if (this.builder_.cursorIndex > 0) {
          this.builder_.cursorIndex -= 1;
          isValidMove = true;
        }
        break;
      case KeyName.RIGHT:
        if (this.builder_.cursorIndex < this.builder_.length) {
          this.builder_.cursorIndex += 1;
          isValidMove = true;
        }
        break;
      case KeyName.HOME:
        this.builder_.cursorIndex = 0;
        isValidMove = true;
        break;
      case KeyName.END:
        this.builder_.cursorIndex = this.builder_.length;
        isValidMove = true;
        break;
      default:
        // Ignored.
        break;
    }

    if (!isValidMove) {
      errorCallback();
    }

    if (key.shiftPressed && this.builder_.cursorIndex != markBeginCursorIndex) {
      stateCallback(this.buildMarkingState(markBeginCursorIndex));
    } else {
      stateCallback(this.buildInputtingState());
    }
    return true;
  }

  handleDeleteKeys(
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

      if (key.name === KeyName.BACKSPACE && this.builder_.cursorIndex > 0) {
        this.builder_.deleteReadingBeforeCursor();
        isValidDelete = true;
      } else if (
        key.name === KeyName.DELETE &&
        this.builder_.cursorIndex < this.builder_.length
      ) {
        this.builder_.deleteReadingAfterCursor();
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

    if (this.reading_.isEmpty && this.builder_.length === 0) {
      // Cancel the previous input state if everything is empty now.
      stateCallback(new EmptyIgnoringPrevious());
    } else {
      stateCallback(this.buildInputtingState());
    }
    return true;
  }

  handlePunctuation(
    punctuationUnigramKey: string,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    if (!this.languageModel_.hasUnigramsForKey(punctuationUnigramKey)) {
      return false;
    }

    if (!this.reading_.isEmpty) {
      errorCallback();
      stateCallback(this.buildInputtingState());
      return true;
    }

    this.builder_.insertReadingAtCursor(punctuationUnigramKey);
    let evictedText = this.popEvictedTextAndWalk();

    let inputtingState = this.buildInputtingState();
    inputtingState.evictedText = evictedText;
    stateCallback(inputtingState);
    return true;
  }

  buildChoosingCandidateState(nonEmptyState: NotEmpty): ChoosingCandidate {
    let anchoredNodes = this.builder_.grid.nodesCrossingOrEndingAt(
      this.actualCandidateCursorIndex
    );

    // sort the nodes, so that longer nodes (representing longer phrases) are
    // placed at the top of the candidate list
    anchoredNodes.sort((a, b) => {
      return (b.node?.key.length ?? 0) - (a.node?.key.length ?? 0);
    });

    let candidates: string[] = [];
    for (let anchor of anchoredNodes) {
      let nodeCandidates = anchor.node?.candidates;
      if (nodeCandidates != undefined) {
        for (let kv of nodeCandidates) {
          candidates.push(kv.value);
        }
      }
    }

    return new ChoosingCandidate(
      nonEmptyState.composingBuffer,
      nonEmptyState.cursorIndex,
      candidates
    );
  }

  buildInputtingState(): Inputting {
    let composedString = this.getComposedString(this.builder_.cursorIndex);

    let head = composedString.head;
    let reading = this.reading_.composedString;
    let tail = composedString.tail;

    let composingBuffer = head + reading + tail;
    let cursorIndex = head.length + reading.length;
    return new Inputting(composingBuffer, cursorIndex, composedString.tooltip);
  }

  buildMarkingState(beginCursorIndex: number): Marking {
    // We simply build two composed strings and use the delta between the shorter
    // and the longer one as the marked text.
    let from = this.getComposedString(beginCursorIndex);
    let to = this.getComposedString(this.builder_.cursorIndex);
    let composedStringCursorIndex = to.head.length;
    let composed = to.head + to.tail;
    let fromIndex = beginCursorIndex;
    let toIndex = this.builder_.cursorIndex;

    if (beginCursorIndex > this.builder_.cursorIndex) {
      [from, to] = [to, from];
      [fromIndex, toIndex] = [toIndex, fromIndex];
    }

    // Now from is shorter and to is longer. The marked text is just the delta.
    let head = from.head;
    let marked = to.head.substring(from.head.length);
    let tail = to.tail;

    // Collect the readings.
    let readings = this.builder_.readings.slice(fromIndex, toIndex);

    let readingUiText = _.join(readings, " "); // What the user sees.
    let readingValue = _.join(readings, "-"); // What is used for adding a user phrase.

    let isValid = false;
    let status = "";
    // Validate the marking.
    if (readings.length < kMinValidMarkingReadingCount) {
      status = kMinValidMarkingReadingCount + " syllables required.";
    } else if (readings.length > kMaxValidMarkingReadingCount) {
      status = kMaxValidMarkingReadingCount + " syllables maximum.";
      // } else if (MarkedPhraseExists(languageModel_.get(), readingValue, marked)) {
      //   status = localizedStrings_.phraseAlreadyExists();
    } else {
      status = "press Enter to add the phrase.";
      isValid = true;
    }

    let tooltip = "Marked: " + marked + ", syllables: " + readingUiText + ", ";

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

  get actualCandidateCursorIndex(): number {
    let cursorIndex = this.builder_.cursorIndex;
    if (this.selectPhraseAfterCursorAsCandidate_) {
      if (cursorIndex < this.builder_.length) {
        ++cursorIndex;
      }
    } else {
      // Cursor must be in the middle or right after a node. So if the cursor is
      // at the beginning, move by one.
      if (!cursorIndex && this.builder_.length > 0) {
        ++cursorIndex;
      }
    }
    return cursorIndex;
  }

  private popEvictedTextAndWalk() {
    // in an ideal world, we can as well let the user type forever, but because
    // the Viterbi algorithm has a complexity of O(N^2), the walk will become
    // slower as the number of nodes increase, therefore we need to "pop out"
    // overflown text -- they usually lose their influence over the whole MLE
    // anyway -- so that when the user type along, the already composed text at
    // front will be popped out
    let evictedText: string = "";

    if (
      this.builder_.grid.width > kComposingBufferSize &&
      this.walkedNodes_.length != 0
    ) {
      let anchor = this.walkedNodes_[0];
      evictedText = anchor.node?.currentKeyValue.value ?? "";
      this.builder_.removeHeadReadings(anchor.spanningLength);
    }

    this.walk();
    return evictedText;
  }

  pinNode(candidate: string): void {
    let cursorIndex: number = this.actualCandidateCursorIndex;
    let selectedNode = this.builder_.grid.fixNodeSelectedCandidate(
      cursorIndex,
      candidate
    );
    let score = selectedNode.node?.scoreForCandidate(candidate);
    if (score != undefined) {
      if (score > kNoOverrideThreshold) {
        this.userOverrideModel_!.observe(
          this.walkedNodes_,
          cursorIndex,
          candidate,
          new Date().getTime()
        );
      }
    }

    this.walk();

    if (this.moveCursorAfterSelection_) {
      let nextPosition = 0;
      for (let node of this.walkedNodes_) {
        if (nextPosition >= cursorIndex) {
          break;
        }
        nextPosition += node.spanningLength;
      }
      if (nextPosition <= this.builder_.length) {
        this.builder_.cursorIndex = nextPosition;
      }
    }
  }

  private walk() {
    // retrieve the most likely trellis, i.e. a Maximum Likelihood Estimation of
    // the best possible Mandarin characters given the input syllables, using
    // the Viterbi algorithm implemented in the Gramambular library.
    let walker = new Walker(this.builder_.grid);

    // the reverse walk traces the trellis from the end
    // then we reverse the nodes so that we get the forward-walked nodes
    let nodes = walker.reverseWalk(this.builder_.grid.width).reverse();

    this.walkedNodes_ = nodes;
  }

  dumpPaths(): NodeAnchor[][] {
    let walker = new Walker(this.builder_.grid);

    let paths = walker.dumpPaths(this.builder_.grid.width);
    let result: NodeAnchor[][] = [];
    for (let path of paths) {
      result.push(path.reverse());
    }
    return result;
  }
}
