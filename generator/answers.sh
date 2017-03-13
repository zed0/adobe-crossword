#!/bin/bash

COUNTER=0
while read line <&3;
do
	COUNTER=$[COUNTER + 1]
	cat clues/$COUNTER-hints
	echo $line
	read answer
	echo -e $line $answer >> answers.txt
done 3<top-2000
