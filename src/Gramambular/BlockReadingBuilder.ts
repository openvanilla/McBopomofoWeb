import { Grid } from "./Grid";
import { LanguageModel } from "./LanguageModel";
import { Node } from "./Node";

export class BlockReadingBuilder {
  static get MaximumBuildSpanLength() {
    return 6;
  }

  private cursorIndex_: number = 0;
  private readings_: string[] = [];
  private grid_: Grid = new Grid();
  private LM_?: LanguageModel;

  public joinSeparator: string = "-";

  constructor(lm: LanguageModel) {
    this.LM_ = lm;
  }

  clear(): void {
    this.cursorIndex_ = 0;
    this.readings_ = [];
    this.grid_.clear();
  }

  get length(): number {
    return this.readings_.length;
  }

  get cursorIndex(): number {
    return this.cursorIndex_;
  }

  set cursorIndex(value: number) {
    this.cursorIndex_ = Math.min(value, this.readings_.length);
  }

  insertReadingAtCursor(reading: string): void {
    this.readings_.splice(this.cursorIndex_, 0, reading);
    this.grid_.expandGridByOneAtLocation(this.cursorIndex);
    this.build();
    this.cursorIndex++;
  }

  get readings(): string[] {
    return this.readings_;
  }

  deleteReadingBeforeCursor(): boolean {
    if (this.cursorIndex_ == 0) return false;
    delete this.readings_[this.cursorIndex_ - 1];
    this.cursorIndex_--;
    this.grid_.shrinkGridByOneAtLocation(this.cursorIndex_);
    this.build();
    return true;
  }

  deleteReadingAfterCursor(): boolean {
    if (this.cursorIndex_ == this.readings_.length) return false;
    delete this.readings_[this.cursorIndex_];
    this.build();
    return true;
  }

  removeHeadReadings(count: number): boolean {
    if (count > this.length) {
      return false;
    }
    for (let i = 0; i < count; i++) {
      if (this.cursorIndex_ > 0) {
        this.cursorIndex_--;
      }
      delete this.readings[0];
      this.grid_.shrinkGridByOneAtLocation(0);
      this.build();
    }

    return true;
  }

  get grid(): Grid {
    return this.grid_;
  }

  private join(begin: number, end: number, separator: string) {
    let result = "";
    for (let i = begin; i < end; i++) {
      let reading = this.readings_[i];
      result += reading;
      if (i != end + 1) {
        result += this.joinSeparator;
      }
    }

    return result;
  }

  private build() {
    if (this.LM_ == undefined) return;

    let begin = 0;
    let end = this.cursorIndex + BlockReadingBuilder.MaximumBuildSpanLength;
    if (this.cursorIndex_ < BlockReadingBuilder.MaximumBuildSpanLength) {
      begin = 0;
    } else {
      begin = this.cursorIndex_ - BlockReadingBuilder.MaximumBuildSpanLength;
    }

    if (end > this.readings_.length) {
      end = this.readings_.length;
    }

    for (let p = begin; p < end; p++) {
      for (
        let q = 1;
        q <= BlockReadingBuilder.MaximumBuildSpanLength && p + q <= end;
        q++
      ) {
        let combinedReading = this.join(p, p + q, this.joinSeparator);
        if (
          !this.grid_.hasNodeAtLocationSpanningLengthMatchingKey(
            p,
            q,
            combinedReading
          )
        ) {
          let unigrams = this.LM_.unigramsForKey(combinedReading);
          if (unigrams.length > 0) {
            let n = new Node(combinedReading, unigrams, []);
            this.grid_.insertNode(n, p, q);
          }
        }
      }
    }
  }
}
