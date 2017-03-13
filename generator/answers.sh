#!/bin/bash

INPUT_FILE="top-2000"
OUTPUT_FILE="answers.txt"
HINTS_PREFIX="clues/hints-"
START_LINE=1
NUM_LINES=100

while getopts "i:o:h:s:n:" opt; do
	case $opt in
		i)
			INPUT_FILE="$OPTARG"
			;;
		o)
			OUTPUT_FILE="$OPTARG"
			;;
		h)
			HINTS_PREFIX="$OPTARG"
			;;
		s)
			START_LINE="$OPTARG"
			;;
		n)
			NUM_LINES="$OPTARG"
			;;
	esac
done

COUNTER=$START_LINE
while read line <&3;
do
	COUNTER=$[COUNTER + 1]
	cat "$HINTS_PREFIX$COUNTER"
	echo $line
	read answer
	echo -e $line $answer >> "$OUTPUT_FILE"
done 3< <(tail "$INPUT_FILE" -n +$START_LINE | head -n "$NUM_LINES")
