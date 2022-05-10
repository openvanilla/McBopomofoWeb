import { LanguageModel, BlockReadingBuilder } from "../Gramambular";
import { BopomofoReadingBuffer } from "../Mandarin";

export class ComposedString {
  head: string = "";
  tail: string = "";
  tooltip: string = "";
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

  private languageModel_: LanguageModel;
  private reading_: BopomofoReadingBuffer;
  private builder_: BlockReadingBuilder;
}
