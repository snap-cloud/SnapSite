#!/bin/bash
if test -n "$1"; then
    # lowercase the locale
    locale=`echo "$1" | tr '[:upper:]' '[:lower:]'`
    # get all strings from Catalan locale
    allstrings=`grep '^    "' static/locales/ca.json | sort`
    if test -e static/locales/$locale.json; then
        # update existing locale with new strings
        echo "Locale `echo $locale | tr '[:lower:]' '[:upper:]'` already exists..."
        if [ `wc -l static/locales/ca.json | cut -f1 -d' '` -eq `wc -l static/locales/$locale.json | cut -f1 -d' '` ]; then
            echo "...and is up to date."
            exit 1
        fi
        oldstrings=`grep '^    "' static/locales/$locale.json | sort`
        newstrings=`diff -u <(echo "$oldstrings") <(echo "$allstrings") | grep -v "+++ /.*" | grep -E "^\+" | sed -E 's#\+.*(".*":$)#    \1\n        "",#g' | sed -E '$s:,$::' `
        # remove last line and attach comma to last entry
        sed '$ d' static/locales/$locale.json | sed -E '$s/$/,/' > /tmp/$locale.json
        echo "$newstrings" >> /tmp/$locale.json
        echo "}" >> /tmp/$locale.json
        mv /tmp/$locale.json static/locales/$locale.json
        echo "...and I've updated it with new strings."
    else
        # new empty locale file
        echo "{" > static/locales/$locale.json
        echo "$allstrings" | sed -E 's:.*:&\n        "",:g' | sed -E '$s:,$::' >> static/locales/$locale.json
        echo "}" >> static/locales/$locale.json
        echo "Locale for language `echo $locale | tr '[:lower:]' '[:upper:]'` created."
        echo "Edit it at static/locales/$locale.json"
    fi
else
    echo "Please provide a locale code"
fi
