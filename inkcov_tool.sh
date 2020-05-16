#!/bin/bash

# Convert the supplied PDF file to greyscale using GhostScript
gs \
  -q -o ./grey_$1 \
  -sDEVICE=pdfwrite \
  -dColorConversionStrategy=/Gray \
  -dProcessColorModel=/DeviceGray \
  $1

# Calculate the coverage for each page
OUT=$(gs -q -o - -sDEVICE=inkcov ./grey_$1 | grep -v Page)

# Remove unnecessary text so only numbers remain
OUT=$(echo $OUT | sed 's/[^0-9"." ]*//g')

# Break numbers into array
OUT=$(echo $OUT | tr " " "\n")

# Get the highest value in the array
IFS=$'\n'
MAX=$(echo "${OUT[*]}" | sort -nr | head -n1)
unset IFS

# Remove PDF files
rm -rf grey_$1 $1

# Multiply the MAX value by 100 (since 0 <= MAX <= 1)
MAX=$( bc -l <<<"100*$MAX" )

# Print the MAX with two decimal places
printf "%.2f\n" "$MAX"