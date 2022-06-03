/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { Node } from "./Node";

export class NodeAnchor {
  node?: Node;
  location: number = 0;
  spanningLength: number = 0;
  accumulatedScore: number = 0;

  toString = (): string => "{@(" + this.location + "," + ")," + this.node + ")";
}
