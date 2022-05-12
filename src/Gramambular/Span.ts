import { Node } from "./Node";

export class Span {
  protected lengthNodeMap_: Map<number, Node> = new Map();
  protected maximumLength_: number = 0;

  clear(): void {
    this.lengthNodeMap_.clear();
    this.maximumLength_ = 0;
  }

  insertNodeOfLength(node: Node, length: number): void {
    this.lengthNodeMap_.set(length, node);
    if (length > this.maximumLength_) {
      this.maximumLength_ = length;
    }
  }

  removeNodeOfLengthGreaterThan(length: number): void {
    if (length > this.maximumLength_) {
      return;
    }

    let max = 0;
    let removeSet = new Set<number>();
    this.lengthNodeMap_.forEach((value, key) => {
      if (key > length) {
        removeSet.add(key);
      } else {
        if (key > max) max = key;
      }
    });

    removeSet.forEach((value) => this.lengthNodeMap_.delete(value));

    this.maximumLength_ = max;
  }

  nodeOfLength(length: number): Node | undefined {
    return this.lengthNodeMap_.get(length);
  }

  get maximumLength(): number {
    return this.maximumLength_;
  }
}
