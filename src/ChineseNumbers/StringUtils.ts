function reverseString(str: string) {
  let result = "";
  for (let i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

export function TrimZerosAtStart(string: string): string {
  let nonZeroFound = false;
  let output = "";
  for (let i = 0; i < string.length; i++) {
    let c = string.charAt(i);
    if (nonZeroFound) {
      output += c;
    } else if (c != "0") {
      nonZeroFound = true;
      output += c;
    }
  }

  return output;
}

export function trimmingZerosAtEnd(string: string): string {
  let reverse = reverseString(string);
  let trimmed = TrimZerosAtStart(reverse);
  let result = reverseString(trimmed);
  return result;
}
