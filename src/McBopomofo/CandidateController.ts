export class Candidate {
  keyCap_: string = "";
  get keyCap(): string {
    return this.keyCap_;
  }

  candidate_: string = "";
  get candidate(): string {
    return this.candidate_;
  }

  selected_: boolean = false;
  get selected(): boolean {
    return this.selected_;
  }

  constructor(keyCap: string, candidate: string, selected: boolean) {
    this.keyCap_ = keyCap;
    this.candidate_ = candidate;
    this.selected_ = selected;
  }
}

export class CandidateController {
  private candidates_: string[] = [];
  private keyCaps_: string[] = [];
  private currentSelectedIndex_: number = 0;

  get currentPageIndex(): number {
    return Math.floor(this.currentSelectedIndex_ / this.keyCaps_.length) + 1;
  }
  get totalPageCount(): number {
    return Math.ceil(this.candidates_.length / this.keyCaps_.length) + 1;
  }

  update(candidates: string[], keyCaps: string[]) {
    this.candidates_ = candidates;
    this.keyCaps_ = keyCaps;
    this.currentSelectedIndex_ = 0;
  }

  getCurrentPage(): Candidate[] {
    let startPage = Math.floor(
      this.currentSelectedIndex_ / this.keyCaps_.length
    );
    var start = startPage * this.keyCaps_.length;
    var endPage = startPage + 1;
    var end = Math.min(endPage * this.keyCaps_.length, this.candidates_.length);
    let keyCapIndex = 0;

    var list: Candidate[] = [];
    for (let i = start; i < end; i++) {
      let candidate = new Candidate(
        this.keyCaps_[keyCapIndex],
        this.candidates_[i],
        i == this.currentSelectedIndex_
      );
      list.push(candidate);
      keyCapIndex++;
    }
    return list;
  }

  goToFirst(): void {
    this.currentSelectedIndex_ = 0;
  }

  goToLast(): void {
    if (this.candidates_.length == 0) return;
    this.currentSelectedIndex_ = this.candidates_.length - 1;
  }

  goToPreviousItem(): void {
    if (this.currentSelectedIndex_ <= 0) {
      return;
    }
    this.currentSelectedIndex_--;
  }

  goToNextItem(): void {
    if (this.currentSelectedIndex_ >= this.candidates_.length - 1) {
      return;
    }
    this.currentSelectedIndex_++;
  }

  goToPreviousPage(): void {
    let current = Math.floor(this.currentSelectedIndex_ / this.keyCaps_.length);
    if (current == 0) {
      return;
    }
    current -= 1;
    this.currentSelectedIndex_ = current * this.keyCaps_.length;
  }

  goToNextPage(): void {
    let current = Math.floor(this.currentSelectedIndex_ / this.keyCaps_.length);
    let last = Math.floor(this.candidates_.length / this.keyCaps_.length);
    if (current == last) {
      return;
    }
    current += 1;
    this.currentSelectedIndex_ = current * this.keyCaps_.length;
  }
}
