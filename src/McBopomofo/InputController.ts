import { BopomofoKeyboardLayout } from "../Mandarin";
import { Candidate, CandidateController } from "./CandidateController";
import {
  ChoosingCandidate,
  Committing,
  Empty,
  EmptyIgnoringPrevious,
  InputState,
  Inputting,
  Marking,
  NotEmpty,
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

class InputUIController {
  private ui: InputUI;
  private cursorIndex: number = 0;
  private tooltip: string = "";
  private candidates: Candidate[] = [];
  private composingBuffer: ComposingBufferText[] = [];

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

  setCandidates(candidates: Candidate[]): void {
    this.candidates = candidates;
  }

  setTooltip(tooltip: string): void {
    this.tooltip = tooltip;
  }

  update(): void {
    let state = new InputUIState(
      this.composingBuffer,
      this.cursorIndex,
      this.candidates,
      this.tooltip
    );
    let json = JSON.stringify(state);
    this.ui.update(json);
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

    default:
      keyName = KeyName.ASCII;
      break;
  }
  let key = new Key(event.key, keyName, event.shiftKey, event.ctrlKey);
  return key;
}

export class InputController {
  private state_: InputState = new Empty();
  private keyHandler_: KeyHandler = (function () {
    let lm = new WebLanguageModel(webData);
    return new KeyHandler(lm);
  })();
  private candidateController_: CandidateController = new CandidateController();
  private ui_: InputUIController;
  private candidateKeys_ = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  constructor(ui: InputUI) {
    this.ui_ = new InputUIController(ui);
  }

  // Resets to empty state.
  reset(): void {
    this.keyHandler_.reset();
    this.enterNewState(new Empty());
  }

  // Sets keyboard layout.
  setKeyboardLayout(layout: string) {
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

  setSelectPhrase(option: string) {
    let flag: boolean = option === "after_cursor";
    this.keyHandler_.selectPhraseAfterCursorAsCandidate = flag;
  }

  setMoveCursorAfterSelection(flag: boolean) {
    this.keyHandler_.moveCursorAfterSelection = flag;
  }

  setLetterMode(letterCase: string) {
    let flag = letterCase === "lower";
    this.keyHandler_.putLowercaseLettersToComposingBuffer = flag;
  }

  setCandidateKeys(keys: string) {
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

  setEscClearEntireBuffer(flag: boolean) {
    this.keyHandler_.escKeyClearsEntireComposingBuffer = flag;
  }

  keyEvent(event: KeyboardEvent): boolean {
    if (event.isComposing) return false;
    if (event.metaKey) return false;
    let key = KeyFromKeyboardEvent(event);
    if (this.state_ instanceof ChoosingCandidate) {
      this.ui_.reset();
      this.handleCandidateKeyEvent(key);
      this.updatePreedit(this.state_);
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

  handleCandidateKeyEvent(key: Key) {
    let selected = this.candidateController_.selectedCandidateWithKey(
      key.ascii
    );

    if (selected != undefined) {
      this.keyHandler_.candidateSelected(selected, (newState) => {
        this.enterNewState(newState);
      });
      return;
    }

    if (key.name === KeyName.RETURN) {
      let current = this.candidateController_.selectedCandidate;
      this.keyHandler_.candidateSelected(current, (newState) => {
        this.enterNewState(newState);
      });
      return;
    }

    if (key.name === KeyName.ESC || key.name === KeyName.BACKSPACE) {
      this.keyHandler_.candidatePanelCancelled((newState) => {
        this.enterNewState(newState);
      });
      return;
    }

    if (key.name === KeyName.SPACE) {
      let current = this.candidateController_.currentPageIndex;
      let total = this.candidateController_.totalPageCount;
      if (current < total) {
        this.candidateController_.goToNextPage();
      } else {
        this.candidateController_.goToFirst();
      }
    } else if (key.name === KeyName.LEFT) {
      this.candidateController_.goToPreviousItem();
    } else if (key.name === KeyName.RIGHT) {
      this.candidateController_.goToNextItem();
    } else if (key.name === KeyName.HOME) {
      this.candidateController_.goToFirst();
    } else if (key.name === KeyName.END) {
      this.candidateController_.goToLast();
    } else if (key.name === KeyName.UP) {
      this.candidateController_.goToPreviousPage();
    } else if (key.name === KeyName.DOWN) {
      this.candidateController_.goToNextPage();
    }
    let result = this.candidateController_.getCurrentPage();
    this.ui_.setCandidates(result);
  }

  private enterNewState(state: InputState): void {
    // console.log("enterNewState " + state.toString());
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
    }
    this.state_ = state;
  }

  handleEmpty(prev: InputState, state: Empty) {
    this.ui_.reset();
    if (prev instanceof NotEmpty) {
      this.ui_.commitString(prev.composingBuffer);
    }
  }

  handleEmptyIgnoringPrevious(prev: InputState, state: EmptyIgnoringPrevious) {
    this.ui_.reset();
  }

  handleCommitting(prev: InputState, state: Committing) {
    this.ui_.reset();
    if (state.text.length > 0) {
      this.ui_.commitString(state.text);
    }
  }

  updatePreedit(state: NotEmpty) {
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

  handleInputting(prev: InputState, state: Inputting) {
    this.ui_.reset();
    if (state.evictedText.length > 0) {
      this.ui_.commitString(state.evictedText);
    }
    this.updatePreedit(state);
  }

  handleChoosingCandidate(prev: InputState, state: ChoosingCandidate) {
    this.candidateController_.update(state.candidates, this.candidateKeys_);
    let result = this.candidateController_.getCurrentPage();
    this.ui_.setCandidates(result);
    this.updatePreedit(state);
    this.ui_.update();
  }

  handleMarking(prev: InputState, state: Marking) {
    this.updatePreedit(state);
    this.ui_.update();
  }
}
