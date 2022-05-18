import { LocalStorage } from "typescript-web-storage";

export class UserPhraseAdder {
  private storage_ = new LocalStorage();

  addUserPhrase(reading: string, phrase: string): void {
    if (reading.length === 0) return;
    if (phrase.length === 0) return;

    let key = "__phrase__" + reading;

    let currentUserPhrases = this.storage_.getItem(key);
    let phrases: string[] = [];
    if ((currentUserPhrases = !null && currentUserPhrases instanceof Array)) {
      if (currentUserPhrases.indexOf(key) >= 0) {
        return;
      }
      phrases.push(...currentUserPhrases);
    }
    phrases.splice(0, 0, phrase);
    this.storage_.setItem(key, phrases);
  }
}
