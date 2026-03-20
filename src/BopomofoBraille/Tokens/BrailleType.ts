/**
 * Selects which braille encoding to produce or parse.
 *
 * `UNICODE` uses braille Unicode code points such as `⠓`, while `ASCII`
 * uses the legacy ASCII braille notation exposed by some assistive tooling.
 */
export enum BrailleType {
  /** Unicode braille cells such as `⠁`. */
  UNICODE = 0,
  /** ASCII braille symbols such as `a` or `#`. */
  ASCII = 1,
}
