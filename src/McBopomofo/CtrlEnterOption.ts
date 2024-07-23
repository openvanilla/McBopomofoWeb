/**
 * What kind of text should be sent when a user enters Ctrl+Enter.
 *
 * - none: Do nothing.
 * - bpmfReadings: Send the Bopomofo readings of the text.
 * - htmlRuby: Send the text with HTML Ruby annotations.
 * - bopomofoBraille: Send the Taiwanese Braille text.
 */
export enum CtrlEnterOption {
  none = 0,
  bpmfReadings = 1,
  htmlRuby = 2,
  bopomofoBraille = 3,
}
