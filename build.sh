#!/bin/bash

#   =====================
#   Snap! Social Platform
#   =====================
#
#   Site builder
#
#   written by Bernat Romagosa
#   bernat@arduino.org
#
#   Copyright (C) 2017 by Bernat Romagosa
#
#   This file is part of the Snap! Social Platform.
#
#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program.  If not, see <http://www.gnu.org/licenses/>.

# parse parameters
while echo $1 | grep ^- > /dev/null; do eval $( echo $1 | sed 's/-//g' | sed 's/=.*//g' | tr -d '\012')=$( echo $1 | sed 's/.*=//g' | tr -d '\012'); shift; done

# iterate over all .snp page descriptor files
function build() {
    for page in `ls *.snp`; do
        echo "Building $page..."

        # create an html file with the same name as the descriptor file
        html=www/"${page%.*}".html
        rm -f $html
        touch $html

        # process all descriptors in the descriptor file
        while read -r descriptor
        do
            # find the template(s) matching the descriptor, possibly more
            # than one per line, separated by semicolons
            declare -a template_names="(${descriptor//;/ })";
            rm -f tmp.html
            for template in ${template_names[*]}; do
                cat templates/$template.html >> tmp.html
            done

            if grep -q @content $html; then
                # replace the @content string for the contents of the template file
                sed -e '/@content/ {' -e 'r tmp.html' -e 'd' -e '}' -i $html
            else
                cat tmp.html >> $html
            fi
        done < "$page"
    done

    rm -f tmp.html
    echo "Done."
}

build

# Watch and build on any file change
if test -n $watch; then
    declare -A lasttimes
    while sleep 1; do
        # ignores hidden files and dirs (./.*)
        for file in `find -type f | grep -v "^\./\." | grep -v "./www/.*\.html"`; do
            time=`stat -c %Z "$file"`

            if [ -z ${lasttimes[$file]} ]; then
                lasttimes["$file"]=$time
            fi

            if [ "$time" != "${lasttimes[$file]}" ]; then
                echo "$file changed."
                echo "Rebuilding..."
                build
                lasttimes["$file"]=$time
                break
            fi
            lasttimes["$file"]=$time
        done
    done
fi
