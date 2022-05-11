import {
  LanguageModel,
  BlockReadingBuilder,
  NodeAnchor,
  Walker,
} from "../Gramambular";
import { BopomofoKeyboardLayout, BopomofoReadingBuffer } from "../Mandarin";
import { UserOverrideModel } from "./UserOverrideModel";
export class ComposedString {
  head: string = "";
  tail: string = "";
  tooltip: string = "";
}

const kComposingBufferSize: number = 10;
const kNoOverrideThreshold: number = -8.0;

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
