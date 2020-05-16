#!/bin/bash
# Count black percentage in a pdf document

infile=$1
[ -z "$1" ] && { echo "Usage: $0  my_file.pdf"; exit 2; }
[ -f "$infile" ] || { echo "$infile does not exist"; exit 2; }
type pdftopng &>/dev/null || { echo "Please install pdftopng (from xpdf)"; exit 2; }
type convert &>/dev/null || { echo "Please install convert (from ImageMagick)"; exit 2; }    

# Temporary directory and files
dir="/tmp/pdf-ink-$$"
tmpfile="$dir/tmp.mpc"
tmpfile2="$dir/tmp2.mpc"

# Delete temporary files on EXIT or interrupts
trap "rm -rf $dir; exit 0" 0
trap "rm -rf $dir; exit 1" 1 2 3 15

# Create the temporary directory
mkdir "$dir"

# First step : convert pdf pages to png images - one image per page - saved at the temp directory
pdftopng -mono "$infile" "${dir}/pages"

# change to temporary directory and continue operations there
cd "$dir"


# Calc histogram for image $1
histogram() {
    # convert to temporary format for faster processing (mpc)
    convert -quiet -regard-warnings "$1" +repage "$tmpfile"
    # dither image
    convert "$tmpfile" +dither -colors 2 -colorspace gray -contrast-stretch 0 "$tmpfile2"
    # calculate histogram
    convert "$tmpfile2" -define histogram:unique-colors=true -format %c histogram:info:-    
}

# Calc percentage for histogram
hist_percent() {
    sed 's/:.*#/ /g' |   # make output parsable
    awk '{b[$3]+=$1; sum+=$1} END { OFS="\t"; for (i in b) print i, (b[i]/sum)*100 }' |   # calculate percentages
    sed 's/gray(255)/white/;s/gray(0)/black/' | column -t  # humanize output
}

# Process each page separately - then pipe histogram to awk for percentage calculation
for f in *.png; do histogram "$f"; done | hist_percent
