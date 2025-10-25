#! /usr/bin/env python3
import sys

input = sys.argv[1]
output = sys.argv[2]
max_length = int(sys.argv[3])
with open(input, "r") as f:
    with open(output, "w") as out:
        lines = f.readlines()
        for line in lines:
            [word, score] = line.split(";")
            if word.isalpha() and len(word) <= max_length and int(score) == 50:
                out.write(line)
