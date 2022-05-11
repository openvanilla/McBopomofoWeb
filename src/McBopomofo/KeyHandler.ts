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

const kComposingBufferSize: number = 10;
const kNoOverrideThreshold: number = -8.0;
const kJoinSeparator = "-";

const kMinValidMarkingReadingCount = 2;
const kMaxValidMarkingReadingCount = 6;

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

  // private putLowercaseLettersToComposingBuffer_: boolean = false;
  // public get putLowercaseLettersToComposingBuffer(): boolean {
  //   return this.putLowercaseLettersToComposingBuffer_;
  // }
  // public set putLowercaseLettersToComposingBuffer(value: boolean) {
  //   this.putLowercaseLettersToComposingBuffer_ = value;
  // }

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
  private userOverrideModel_: UserOverrideModel;

  constructor(languageModel: LanguageModel) {
    this.languageModel_ = languageModel;
    this.reading_ = new BopomofoReadingBuffer(
      BopomofoKeyboardLayout.StandardLayout
    );
    this.builder_ = new BlockReadingBuilder(this.languageModel_);
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
      if (node == undefined) {
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

    let head = composed.substr(0, composedCursor);
    let tail = composed.substr(
      composedCursor,
      composed.length - composedCursor
    );
    return new ComposedString(head, tail, tooltip);
  }

  handleCursorKeys(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void
  ): boolean {
    if (
      state instanceof Inputting == false &&
      state instanceof Marking == false
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
    if (state instanceof NotEmpty == false) {
      return false;
    }

    if (this.reading_.hasToneMarkerOnly) {
      this.reading_.clear();
    } else if (this.reading_.isEmpty) {
      let isValidDelete = false;

      if (key.ascii == Key.BACKSPACE && this.builder_.cursorIndex > 0) {
        this.builder_.deleteReadingBeforeCursor();
        isValidDelete = true;
      } else if (
        key.ascii == Key.DELETE &&
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
      if (key.ascii == Key.BACKSPACE) {
        this.reading_.backspace();
      } else {
        // Del not supported when bopomofo reading is active.
        errorCallback();
      }
    }

    if (this.reading_.isEmpty && this.builder_.length == 0) {
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
      return a.node.key.length - b.node.key.length;
    });

    let candidates: string[] = [];
    for (let anchor of anchoredNodes) {
      let nodeCandidates = anchor.node.candidates;
      for (let kv of nodeCandidates) {
        candidates.push(kv.value);
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
      //   status = localizedStrings_->phraseAlreadyExists();
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
      this.walkedNodes_.length == 0
    ) {
      let anchor = this.walkedNodes_[0];
      evictedText = anchor.node.currentKeyValue.value;
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
    let score = selectedNode.node.scoreForCandidate(candidate);
    if (score > kNoOverrideThreshold) {
      this.userOverrideModel_.observe(
        this.walkedNodes_,
        cursorIndex,
        candidate,
        new Date().getTime()
      );
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
}
