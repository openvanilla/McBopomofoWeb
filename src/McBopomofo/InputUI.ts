export interface InputUI {
  reset(): void;
  commitString(text: string): void;

  resetTooltip(): void;
  setTooltip(tooltip: string): void;
}
