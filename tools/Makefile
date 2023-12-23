encode: encode.cpp  Mandarin.cpp
	c++ -o $@ $^ -I./. -std=c++11

clean: encode
	rm -f encode

convert: encode data.txt txt_to_map.py
	cat data.txt | ./encode | python3 txt_to_map.py
