// Localization

function Localizer (lang) {
    this.init(lang);
};

Localizer.prototype.init = function (lang) {
    var request = new XMLHttpRequest(),
        myself = this;

    this.locale = lang || localStorage['locale'];
    this.translations = {};

    if (!this.locale || this.locale === 'en') {
        return;
    }

    request.open('GET', 'locales/' + this.locale + '.json?random=' +
        Math.random(1000), false);
    request.setRequestHeader('Content-type',
        'application/json; charset=UTF-8');
    request.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200 || this.status === 0) {
                myself.loadTranslations(this.responseText);
            }
        }
    };
    request.send(null);
};

Localizer.prototype.loadTranslations = function (fileContents) {
    this.translations = JSON.parse(fileContents);
};

Localizer.prototype.localizePage = function () {
    var myself = this;
    document.querySelectorAll('[localizable]').forEach(function (element) {
        element.innerHTML = myself.localize(element.innerHTML);
    })
};

Localizer.prototype.localize = function (aString) {
    return this.translations[aString] || aString;
};

Localizer.prototype.setLanguage = function (lang) {
    localStorage['locale'] = lang;
    location.reload();
};

Localizer.missingStrings = function (lang) {
    var localizer = new Localizer(lang);

    if (!sessionStorage['missing-strings-' + lang]) {
       sessionStorage['missing-strings-' + lang] = JSON.stringify({});
    }

    var missing = JSON.parse(sessionStorage['missing-strings-' + lang]);

    document.querySelectorAll('[localizable]').forEach(
        function (element) {
            var string = element.innerHTML;
            if (!(localizer.translations[string])) {
                missing[string] = '';
                element.style.border = '2px dashed red';
            }
        }
    );

    sessionStorage['missing-strings-' + lang] = JSON.stringify(missing);

    if (Object.keys(missing)[0]) {
        console.log(
            'This page contains missing strings.\n' +
            'They have been added to sessionStorage["missing-strings-' +
            lang + '"] as stringified JSON.'
        );
    }
};
