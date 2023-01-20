encode: encode.cpp Mandarin.h Mandarin.cpp
	c++ -o $@ $^

clean: encode
	rm -f encode

convert: encode data.txt txt_to_map.py
	cat data.txt | ./encode | python3 txt_to_map.py
