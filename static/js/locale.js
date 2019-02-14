// Localization

function Localizer () {
    this.init();
};

Localizer.prototype.init = function () {
    var request = new XMLHttpRequest(),
        myself = this;

    this.locale = localStorage['locale'];
    this.translations = {};

    if (!this.locale || this.locale === 'en') {
        return;
    }

    request.open('GET', 'locales/' + this.locale + '.json?random=' + Math.random(1000), false);
    request.setRequestHeader('Content-type', 'application/json; charset=UTF-8')    
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
