import { join } from "path";
import { Grid } from "./Grid";
import { kSelectedCandidateScore } from "./Node";
import { NodeAnchor } from "./NodeAnchor";

const kDroppedPathScore = 999;
export class Walker {
  private grid_: Grid;

  constructor(grid: Grid) {
    this.grid_ = grid;
  }

  dumpPaths(
    location: number = 0,
    accumulatedScore: number = 0
  ): NodeAnchor[][] {
    if (!location || location > this.grid_.width) {
      return [];
    }
    let paths: NodeAnchor[][] = [];
    let nodes = this.grid_.nodesEndingAt(location);

    nodes.forEach((node) => {
      if (node.node === undefined) {
        return;
      }
      node.accumulatedScore = accumulatedScore + node.node.score;
      let result = this.dumpPaths(
        location - node.spanningLength,
        node.accumulatedScore
      );
      if (result.length > 0) {
        for (let path of result) {
          path.splice(0, 0, node);
          paths.push(path);
        }
      } else {
        let path = [node];
        paths.push(path);
      }
    });

    return paths;
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

    let score = nodes[0].node?.score ?? 0;
    if (score >= kSelectedCandidateScore) {
      let node = nodes[0];
      node.accumulatedScore = accumulatedScore + (node.node?.score ?? 0);
      let path = this.walk(
        location + node.spanningLength,
        node.accumulatedScore
      );
      path.splice(0, 0, node);
      paths.push(path);
    } else if (longPhrases.length > 0) {
      for (let node of nodes) {
        if (node.node === undefined) {
          continue;
        }
        var path: NodeAnchor[] = [];
        let joinedValue = joinedPhrase + node.node?.currentKeyValue.value;
        if (longPhrases.includes(joinedValue)) {
          node.accumulatedScore = kDroppedPathScore;
          path.push(node);
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
        if (node.spanningLength >= 2) {
          newLongPhrases.push(value);
        }
      });
      longPhrases.sort((a, b) => b.length - a.length);

      for (let node of nodes) {
        if (node.node === undefined) {
          continue;
        }
        node.accumulatedScore = accumulatedScore + node.node?.score ?? 0;
        if (node.spanningLength > 1) {
          let path = this.walk(
            location + node.spanningLength,
            node.accumulatedScore,
            "",
            []
          );
          path.splice(0, 0, node);
          paths.push(path);
        } else {
          let path = this.walk(
            location + 1,
            node.accumulatedScore,
            node.node.currentKeyValue.value,
            longPhrases
          );
          path.splice(0, 0, node);
          paths.push(path);
        }
      }
    }

    if (!paths.length) {
      return [];
    }

    let result = paths[0];
    for (let path of paths) {
      if (
        path[path.length - 1].accumulatedScore >
        result[result.length - 1].accumulatedScore
      ) {
        result = path;
      }
    }
    return result;
  }
}
