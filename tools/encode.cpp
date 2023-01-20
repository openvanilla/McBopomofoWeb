#include <cassert>
#include <iostream>
#include <sstream>
#include <string>

#include "Mandarin.h"

std::string GetScore(const std::string& s) {
  double d = std::stod(s);
  if (d == 0) {
    return "0";
  }

  std::stringstream ss;
  ss.precision(4);
  ss << d;
  return ss.str();
}

int main() {
  std::string line;
  std::string reading;
  std::string value;
  std::string score;
  double sc = 0;

  while (std::cin.good()) {
    std::getline(std::cin, line);
    if (line.empty() || line[0] == '#') {
      continue;
    }
    std::stringstream linestream(line);
    linestream >> reading >> value >> score;

    if (reading[0] == '_') {
      std::cout << reading << " " << value << " " << GetScore(score) << "\n";
      continue;
    }

    std::string oldReading;
    std::string newReading;
    std::string component;
    auto i = reading.begin();
    auto e = reading.end();
    while (i != e) {
      if (*i != '-') {
        component += *i;
      }

      if (*i == '-' || (i + 1) == e) {
        oldReading += component;
        auto s =
            Formosa::Mandarin::BopomofoSyllable::FromComposedString(component);
        auto abs = s.absoluteOrderString();
        auto t =
            Formosa::Mandarin::BopomofoSyllable::FromAbsoluteOrderString(abs);
        assert(s.composedString() == t.composedString());
        newReading += abs;
        component = "";
      }
      ++i;
    }
    std::cout << newReading << " " << value << " " << GetScore(score) << "\n";
  }

  return 0;
}
