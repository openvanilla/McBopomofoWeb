.PHONY: all clean

CXX = c++
CXXFLAGS = -std=c++11 -I./.
TARGET_DIR = ../src/McBopomofo

all: $(TARGET_DIR)/WebData.ts $(TARGET_DIR)/WebDataPlain.ts

encode: encode.cpp Mandarin.cpp
	$(CXX) -o $@ $^ $(CXXFLAGS)

$(TARGET_DIR)/WebData.ts: encode data.txt txt_to_map.py
	cat data.txt | ./encode | python3 txt_to_map.py > $@

$(TARGET_DIR)/WebDataPlain.ts: encode data-plain-bpmf.txt txt_to_map.py
	cat data-plain-bpmf.txt | ./encode | python3 txt_to_map.py > $@

clean:
	rm -f encode
