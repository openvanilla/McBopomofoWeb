/**
 * What kind of text should be sent when a user enters Ctrl+Enter.
 *
 * - none: Do nothing.
 * - bpmfReadings: Send the Bopomofo readings of the text.
 * - htmlRuby: Send the text with HTML Ruby annotations.
 * - bopomofoBraille: Send the Taiwanese Braille text.
 * - hanyuPinyin: Send the Hanyu Pinyin readings of the text.
 */
export enum CtrlEnterOption {
  None = 0,
  BpmfReadings = 1,
  HtmlRuby = 2,
  BopomofoBraille = 3,
  HanyuPinyin = 4,
}
