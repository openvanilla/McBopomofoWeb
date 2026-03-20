/**
 * @license
 * Copyright (c) 2022 and onwards The McBopomofo Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 */

/**
 * A module for converting Bopomofo (Zhuyin) characters to Braille and vice
 * versa.
 *
 * The module provides functionality to:
 * - Work with Bopomofo syllables
 * - Convert Bopomofo text to Braille
 *
 * @module BopomofoBraille
 * @packageDocumentation
 */

/** Stateless conversion helpers for Taiwanese braille text. */
export { BopomofoBrailleConverter } from "./Converter";
/** Token model for a single Bopomofo syllable in braille conversion flows. */
export { BopomofoSyllable } from "./Tokens/BopomofoSyllable";
/** Encoding options supported by the braille converters. */
export { BrailleType } from "./Tokens/BrailleType";
