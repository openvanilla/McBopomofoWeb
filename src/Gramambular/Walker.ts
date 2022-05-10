import { Grid } from "./Grid";
import { NodeAnchor } from "./NodeAnchor";

export class Walker {
  private grid_: Grid;

  constructor(grid: Grid) {
    this.grid_ = grid;
  }

  reverseWalk(location: number, accumulatedScore: number = 0): NodeAnchor[] {
    if (!location || location > this.grid_.width) {
      return [];
    }
    let paths: NodeAnchor[][] = [];
    let nodes = this.grid_.nodesEndingAt(location);
    nodes.forEach((node) => {
      if (node.node == undefined) {
        return;
      }
      node.accumulatedScore = accumulatedScore + node.node.score;
      let path = this.reverseWalk(
        location - node.spanningLength,
        node.accumulatedScore
      );
      path.splice(0, 0, node);
      paths.push(path);
    });

    if (!paths.length) {
      return [];
    }

    let result: NodeAnchor[] = paths[0];
    paths.forEach((path) => {
      if (
        path[path.length - 1].accumulatedScore >
        result[result.length - 1].accumulatedScore
      ) {
        result = path;
      }
    });
    return result;
  }
}
