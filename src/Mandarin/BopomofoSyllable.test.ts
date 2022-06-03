/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

import { BopomofoSyllable } from "./index";

describe("Test Pintin", () => {
  test("Test 1", () => {
    let s = "yang5";
    let result = BopomofoSyllable.FromHanyuPinyin(s);
    console.log(result);
    console.log(result.hasToneMarker);
  });
});
