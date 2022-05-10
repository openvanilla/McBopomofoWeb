import { Span } from "./Span";
import { Node } from "./Node";
import { NodeAnchor } from "./NodeAnchor";

export class Grid {
  private spans_: Span[] = [];

  clear = () => (this.spans_ = []);

  insertNode(node: Node, location: number, spanningLength: number): void {
    if (location > this.spans_.length) {
      let diff = location - this.spans_.length + 1;
      for (let i = 0; i < diff; i++) {
        this.spans_.push(new Span());
      }
    }
    this.spans_[location].insertNodeOfLength(node, spanningLength);
  }

  hasNodeAtLocationSpanningLengthMatchingKey(
    location: number,
    spanningLength: number,
    key: string
  ): boolean {
    if (location > this.spans_.length) return false;
    let n = this.spans_[location].nodeOfLength(length);
    if (n === undefined) return false;
    return key === n.key;
  }

  expandGridByOneAtLocation(location: number): void {
    if (location === 0 || location === this.spans_.length) {
      this.spans_.splice(location, 0, new Span());
    } else {
      this.spans_.splice(location, 0, new Span());
      for (let i = 0; i < location; i++) {
        this.spans_[i].removeNodeOfLengthGreaterThan(location - i);
      }
    }
  }

  shrinkGridByOneAtLocation(location: number): void {
    if (location >= this.spans_.length) return;
    delete this.spans_[location];
    for (let i = 0; i < location; i++) {
      this.spans_[i].removeNodeOfLengthGreaterThan(location - i);
    }
  }

  get width(): number {
    return this.spans_.length;
  }

  nodesEndingAt(location: number): NodeAnchor[] {
    let result: NodeAnchor[] = [];
    if (this.spans_.length > 0 && location < this.spans_.length) {
      for (let i = 0; i < location; i++) {
        let span = this.spans_[i];
        if (i + span.maximumLength >= location) {
          let node = span.nodeOfLength(location - i);
          if (node != undefined) {
            let na = new NodeAnchor();
            na.node = node;
            na.location = i;
            na.spanningLength = location - i;
            result.push(na);
          }
        }
      }
    }
    return result;
  }

  nodesCrossingOrEndingAt(location: number): NodeAnchor[] {
    let result: NodeAnchor[] = [];

    if (this.spans_.length > 0 && location < this.spans_.length) {
      for (let i = 0; i < location; i++) {
        let span = this.spans_[i];
        if (i + span.maximumLength >= location) {
          for (let j = 1, m = span.maximumLength; j < m; j++) {
            if (i + j < location) {
              continue;
            }

            let node = span.nodeOfLength(j);
            if (node != undefined) {
              let na = new NodeAnchor();
              na.node = node;
              na.location = i;
              na.spanningLength = location - i;
              result.push(na);
            }
          }
        }
      }
    }

    return result;
  }

  fixNodeSelectedCandidate(location: number, value: string): NodeAnchor {
    let nodes = this.nodesCrossingOrEndingAt(location);
    let node = new NodeAnchor();
    for (let n = 0; n < nodes.length; n++) {
      let nodeAnchor = nodes[n];
      let candidates = nodeAnchor.node.candidates ?? [];
      nodeAnchor.node.resetCandidate();

      for (let i = 0, c = candidates.length; i < c; ++i) {
        if (candidates[i].value === value) {
          nodeAnchor.node.selectCandidateAtIndex(i);
          node = nodeAnchor;
          break;
        }
      }
    }
    return node;
  }

  overrideNodeScoreForSelectedCandidate(
    location: number,
    value: string,
    overridingScore: number
  ) {
    let nodes = this.nodesCrossingOrEndingAt(location);
    for (let n = 0; n < nodes.length; n++) {
      let nodeAnchor = nodes[n];
      let candidates = nodeAnchor.node.candidates ?? [];
      nodeAnchor.node.resetCandidate();

      for (let i = 0, c = candidates.length; i < c; ++i) {
        if (candidates[i].value === value) {
          nodeAnchor.node.selectFloatingCandidateAtIndex(i, overridingScore);
          break;
        }
      }
    }
  }
}
