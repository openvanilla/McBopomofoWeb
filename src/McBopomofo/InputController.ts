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
import { InputUI } from "./InputUI";
import { Key, KeyName } from "./Key";
import { KeyHandler } from "./KeyHandler";
import { webData } from "./WebData";
import { WebLanguageModel } from "./WebLanguageModel";

function KeyFromKeyboardEvent(event: KeyboardEvent) {
  let keyName = KeyName.UNKNOWN;
  switch (event.key) {
    case "ArrowLeft":
      keyName = KeyName.LEFT;
    case "ArrowRight":
      keyName = KeyName.RIGHT;
    case "Home":
      keyName = KeyName.HOME;
    case "End":
      keyName = KeyName.END;
    default:
      if (event.key.length == 1) {
        keyName = KeyName.ASCII;
      }
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
  private ui_: InputUI;
  private candidateKeys_ = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  constructor(ui: InputUI) {
    this.ui_ = ui;
  }

  activate(): void {}

  deactivate(): void {}

  keyEvent(event: KeyboardEvent): void {
    if (event.isComposing) return;
    if (event.metaKey) return;
    let key = KeyFromKeyboardEvent(event);
    if (this.state_ instanceof ChoosingCandidate) {
      // TODO: handle candidates
      return;
    }
    let accepted = this.keyHandler_.handle(
      key,
      this.state_,
      (newState) => this.enterNewState(newState),
      () => {}
    );
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

  updatePreedit(state: NotEmpty) {}

  handleInputting(prev: InputState, state: Inputting) {
    this.ui_.reset();
    if (state.evictedText.length > 0) {
      this.ui_.commitString(state.evictedText);
    }
    this.updatePreedit(state);
  }

  handleChoosingCandidate(prev: InputState, state: ChoosingCandidate) {
    this.updatePreedit(state);
  }

  handleMarking(prev: InputState, state: Marking) {
    this.updatePreedit(state);
  }
}
