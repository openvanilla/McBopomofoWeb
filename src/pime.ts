// The default settings.
// var defaultSettings = {
//   layout: "standard",
//   select_phrase: "before_cursor",
//   candidate_keys: "123456789",
//   esc_key_clear_entire_buffer: false,
//   shift_key_toggle_alphabet_mode: true,
//   chineseConversion: false,
//   move_cursor: true,
//   letter_mode: "upper",
// };
// let settings = defaultSettings;

// Note: events
// onActivate
// onDeactivate
// filterKeyDown
// onKeyDown
// filterKeyUp
// onKeyUp
// onPreservedKey
// onCommand
// onMenu
// onCompartmentChanged
// onKeyboardStatusChanged
// onCompositionTerminated
// init

import { InputController } from "./McBopomofo/InputController";
import { InputUI } from "./McBopomofo/InputUI";

class PimeMcBopomofo {
  mcInputController: InputController;
  uiState: any = {
    compositionString: "",
    compositionCursor: 0,
    showCandidates: false,
    candidateList: [],
    candidateCursor: 0,
  };

  constructor() {
    this.mcInputController = new InputController(this.makeUI(this));
  }

  makeUI(controller: PimeMcBopomofo): InputUI {
    let that: InputUI = {
      reset: () => {
        controller.uiState = {
          compositionString: "",
          compositionCursor: 0,
          showCandidates: false,
          candidateList: [],
          candidateCursor: 0,
        };
      },
      commitString(text: string) {
        controller.uiState = {
          commitSting: text,
          compositionString: "",
          compositionCursor: 0,
          showCandidates: false,
          candidateList: [],
          candidateCursor: 0,
        };
      },
      update(stateString: string) {
        let state = JSON.parse(stateString);
        let buffer = state.composingBuffer;
        let candidates = state.candidates;
        let selectedIndex = 0;
        let index = 0;
        let candidateList = [];
        for (let candidate of state.candidates) {
          if (candidate.selected) {
            selectedIndex = index;
          }
          candidateList.push(candidate.candidate.displayedText);
          index++;
        }

        controller.uiState = {
          compositionString: buffer,
          compositionCursor: state.cursorIndex,
          showCandidates: candidates.length > 0,
          candidateList: candidateList,
          candidateCursor: selectedIndex,
        };
      },
    };
    return that;
  }

  defaultActivateResponse(): any {
    return {
      customizeUI: {
        candPerRow: 9,
        candFontSize: 16,
        candFontName: "MingLiu",
        candUseCursor: true,
      },
      seqNum: 0,
      setSelKeys: "123456789",
      addButton: [
        {
          id: "switch-lang",
          icon: "icon file path",
          commandId: 1,
          tooltip: "中英文切換",
        },
        {
          id: "windows-mode-icon",
          icon: "icon file path",
          commandId: 4,
          tooltip: "中英文切換",
        },
        {
          id: "switch-shape",
          icon: "icon file path",
          commandId: 2,
          tooltip: "全形/半形切換",
        },
        {
          id: "settings",
          icon: "icon file path",
          type: "menu",
          tooltip: "設定",
        },
      ],
    };
  }
}

// https://hackmd.io/@SYkYaRqjTQm-oj2WqaWhUQ/BJ0xsY5A?type=slide#/
const pimeMcBopomofo = new PimeMcBopomofo();

module.exports = {
  textReducer(request: any, preState: any) {
    if (request["method"] === "init") {
      return Object.assign({}, preState, {
        action: "",
        compositionString: "",
        compositionCursor: 0,
        showCandidates: false,
        candidateList: [],
        candidateCursor: 0,
      });
    }

    if (request.method === "onActivate") {
      let response = pimeMcBopomofo.defaultActivateResponse();
      response.success = true;
      response.seqNum = request.seqNum;
      return response;
    }

    if (request.method === "onKeyDown") {
      // TODO: let input controller handle key
    }

    return preState;
  },
  response(request: any, preState: any) {
    if (request.method === "filterKeyDown") {
      return { return: true, success: true, seqNum: request.seqNum };
    }

    if (request.method === "onKeyDown") {
      return Object.assign({}, preState, pimeMcBopomofo.uiState);
    }
  },
};
