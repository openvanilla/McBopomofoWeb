import { Node } from "./Node";

export class NodeAnchor {
  node?: Node;
  location: number = 0;
  spanningLength: number = 0;
  accumulatedScore: number = 0;

  toString = (): string => "{@(" + this.location + "," + ")," + this.node + ")";
}
