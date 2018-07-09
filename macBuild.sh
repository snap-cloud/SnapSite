#!/bin/bash

#   ========
#   Snippets
#   ========
#
#   Snippets is Not (In Principle) a Perfect, Exhaustive Template System
#
#   Site builder
#
#   written by Bernat Romagosa
#   bernat@romagosa.work
#
#   Copyright (C) 2018 by Bernat Romagosa
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
#

# parse parameters
while echo $1 | grep ^- > /dev/null; do eval $( echo $1 | sed 's/-//g' | sed 's/=.*//g' | tr -d '\012')=$( echo $1 | sed 's/.*=//g' | tr -d '\012'); shift; done

# iterate over all .snp page descriptor files
function build() {
    for page in `ls pages/*.snp`; do
        echo "Building $page..."

        # create an html file with the same name as the descriptor file
        # see https://www.gnu.org/software/bash/manual/bash.html#Shell-Parameter-Expansion
        filename="${page#pages/}"
        html=www/"${filename%.*}".html
        rm -f $html
        touch $html

        # process all descriptors in the descriptor file
        while read -r descriptor
        do
            # check whether the current line defines parameter values
            if [[ $descriptor == @param* ]]; then
                # we remove everything after "@params " and execute it,
                # then we jump to the next line
                eval "export ${descriptor#@param }"
                continue
            fi

            # find the template(s) matching the descriptor, possibly more
            # than one per line, separated by semicolons
            declare -a template_names="(${descriptor//;/ })";
            rm -f tmp.html
            for template in ${template_names[*]}; do
                # append to the temporary HTML file, evaluating any possible params
                envsubst < templates/$template.tmp >> tmp.html
                # cat templates/$template.tmp >> tmp.html
            done

            if grep -q @content $html; then
                # replace the @content string for the contents of the template file
                sed -e '/@content/ {' -e 'r tmp.html' -e 'd' -e '}' -i "" $html
            else
                cat tmp.html >> $html
            fi
            # fix char encoding in case sed has messed it up
            iconv -f `file -I $html | cut -f2 -d=` -t UTF-8 $html > iconv.out
            mv -f iconv.out $html
        done < "$page"
    done

    # copy over all static files
    cp -R static/* www

    rm -f tmp.html
    echo "Done."
}

build

if test -n "$serve" -o -n "$s"; then
    function runserver() {
        (cd www; exec -a httpserver $@ &)
    }

    pkill -f httpserver
    if test -n `which http-server`; then
        runserver http-server
    elif test -n `which python`; then
        runserver python -m SimpleHTTPServer 8080
    elif test -n `which ruby`; then
        runserver ruby -run -ehttpd . -p8080
    elif test -n `which php`; then
        runserver php -S 127.0.0.1:8080
    else
        echo "Could not find a way to serve static files. Please install one of the following:"
        echo
        echo "Ruby"
        echo "Python"
        echo "NodeJS http-server module"
        echo "PHP"
    fi
elif test -n "$S"; then # https is only supported by http-server
    (cd www; exec -a httpserver http-server -S &)
fi

# Watch and build on any file change

if test -n "$watch" -o -n "$w"; then
    declare -A lasttimes
    while sleep 1; do
        # ignores hidden files and dirs (./.*) and the www folder
        for file in `find -type f | grep -v "^\./\." | grep -v "./www/.*"`; do
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
