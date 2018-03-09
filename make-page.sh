#!/bin/bash
if test -n "$1"; then
    if test -e pages/$1.snp; then
        echo "This page already exists"
    else
        echo -e "base\n$1\nbase-bottom" > pages/$1.snp
        if test -e templates/$1.tmp; then
            echo "A template for this page already exists"
        else
            title="$(tr '[:lower:]' '[:upper:]' <<< ${1:0:1})${1:1}" # Uppercase first letter
            echo -e "<h1>$title</h1>" > templates/$1.tmp

        fi
    fi
else
    echo "Please provide a page name"
fi
