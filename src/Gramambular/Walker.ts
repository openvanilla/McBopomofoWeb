import { join } from "path";
import { Grid } from "./Grid";
import { NodeAnchor } from "./NodeAnchor";

const kDroppedPathScore = 999;
export class Walker {
  private grid_: Grid;

  constructor(grid: Grid) {
    this.grid_ = grid;
  }

  walk(
    location: number,
    accumulatedScore: number = 0,
    joinedPhrase: string = "",
    longPhrases: string[] = []
  ): NodeAnchor[] {
    if (location >= this.grid_.width) {
      return [];
    }
    let paths: NodeAnchor[][] = [];
    let nodes = this.grid_.nodesAt(location);
    nodes.sort((a, b) => (b.node?.score ?? 0) - (a.node?.score ?? 0));
    if (nodes[0].node?.score ?? 0 >= 99) {
      let node = nodes[0];
      node.accumulatedScore = accumulatedScore + (node.node?.score ?? 0);
      let path = this.walk(
        location + node.spanningLength,
        node.accumulatedScore
      );
      path.splice(0, 0, node);
      paths.push(path);
    } else if (longPhrases.length > 0) {
      var path: NodeAnchor[] = [];
      for (let node of nodes) {
        if (node.node == undefined) {
          continue;
        }
        let joinedValue = joinedPhrase + node.node?.currentKeyValue.value;
        if (longPhrases.includes(joinedValue)) {
          node.accumulatedScore = kDroppedPathScore;
          path.splice(0, 0, node);
          paths.push(path);
          continue;
        }

        node.accumulatedScore = accumulatedScore + node.node?.score ?? 0;
        if (joinedValue.length >= longPhrases[0].length) {
          path = this.walk(
            location + node.spanningLength,
            node.accumulatedScore,
            "",
            []
          );
        } else {
          path = this.walk(
            location + node.spanningLength,
            node.accumulatedScore,
            joinedValue,
            longPhrases
          );
        }
        path.splice(0, 0, node);
        paths.push(path);
      }
    } else {
      let newLongPhrases = [];
      nodes.forEach((node) => {
        let value = node.node?.currentKeyValue.value ?? "";
        if (value.length >= 3) {
          newLongPhrases.push(value);
        }
      });
      longPhrases.sort((a, b) => b.length - a.length);
      var path: NodeAnchor[] = [];
      for (let node of nodes) {
        if (node.node == undefined) {
          continue;
        }
        node.accumulatedScore = accumulatedScore + node.node?.score ?? 0;

        if (node.spanningLength > 1) {
          path = this.walk(
            location + node.spanningLength,
            node.accumulatedScore,
            "",
            []
          );
        } else {
          path = this.walk(
            location + 1,
            node.accumulatedScore,
            node.node.currentKeyValue.value,
            longPhrases
          );
        }
        path.splice(0, 0, node);
        paths.push(path);
      }
    }

    return [];
  }
}
