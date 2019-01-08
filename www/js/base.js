var snapURL = '/snap/snap.html';
    modules = [], // compatibility with cloud.js
    nop = function () {},
    localizer = new Localizer(),
    buttonDefaults = { done: { text: 'Ok', default: true }, cancel: { text: 'Cancel' } };

function getUrlParameter (param) {
    var regex = new RegExp('[?&]' + param + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

function pageUser () {
    return getUrlParameter('user');
};

function pageProject () {
    return getUrlParameter('project');
};

// Data insertion

function fillVisitorFields () {
    if (sessionStorage.username) {
        document.querySelectorAll('.visitor').forEach(function (each) {
            each.innerHTML = escapeHtml(sessionStorage.username);
        });
    }
};

function fillUsernameFields () {
    var username = pageUser();
    if (username) {
        document.querySelectorAll('.username').forEach(function (each) {
            each.innerHTML = escapeHtml(username);
        });
    }
};

function setTitle (newTitle) {
    document.title = newTitle;
};

// Element creation

function authorSpan (author, newTab) {
    var span = document.createElement('span');
    span.classList.add('author');
    span.innerHTML =
        localizer.localize(' by ') + '<a href="user.html?user=' + encodeURIComponent(author) +
        '"' + (newTab ? 'target="_blank"' : '') + '><strong>' + escapeHtml(author) + '</strong></a>';
    return span;
};

function isPublicSpan (isPublic) {
    var span = document.createElement('span'),
        tooltip = isPublic ?
            'This project can be shared via URL' :
            'This project is private',
        faClass = isPublic ? 'fa-unlock' : 'fa-lock';
    span.classList.add('is-public');
    span.innerHTML = '<small><i class="fa ' + faClass + '" aria-hidden="true"></i></small>';
    span.title = localizer.localize(tooltip);
    return span;
};

function isPublishedSpan (isPublished) {
    var span = document.createElement('span'),
        tooltip = isPublished ?
            'This project is publicly listed' :
            'This project is unlisted',
        faClass = isPublished ? 'fa-eye' : 'fa-user-secret';

    span.classList.add('is-published');
    span.innerHTML = '<small><i class="fa ' + faClass + '" aria-hidden="true"></i></small>';
    span.title = localizer.localize(tooltip);
    return span;
};

function projectURL (author, project) {
    return snapURL + '#present:Username=' + encodeURIComponent(author) +
        '&ProjectName=' + encodeURIComponent(project);
};

function projectSpan (author, project) {
    var span = document.createElement('span');
    span.classList.add('project-link');
    span.innerHTML =
        '<a href="project.html?user=' + encodeURIComponent(author) +
        '&project=' + encodeURIComponent(project) + '">' +
        escapeHtml(project) + '</a>';
    return span;
};

// Error handling

function genericError (errorString, title) {
    doneLoading();
    alert(
        localizer.localize(errorString || 'Unknown error'),
        { title: localizer.localize(title || 'Error')}
    );
    console.error(errorString);
};

// Page loading

function beganLoading (selector) {
    var loader;
    if (selector) {
        loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = '<i class="fa fa-spinner fa-spin fa-3x" aria-hidden="true"></i>';
        document.querySelector(selector).append(loader);
    }
};

function doneLoading (selector) {
    localizer.localizePage();
    document.querySelector(selector ? (selector + '> .loader') : '#loading').hidden = true;
};

// Other goodies

function formatDate (dateString) {
    return (new Date(dateString + ':00')).toLocaleString(
        localizer.locale || 'en-us',
        { month: 'long', day: '2-digit', year: 'numeric' }
    );
};

function escapeHtml (text) {
    // Based on an answer by Kip @ StackOverflow
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, function (m) { return map[m]; }) : ''
};

// JS additions

Array.prototype.sortBy = function (parameter, reverse) {
    return this.sort(
        function (a, b) {
            if (reverse) {
                return (a[parameter] > b[parameter]) ? 1 : -1;
            } else {
                return (a[parameter] > b[parameter]) ? -1 : 1;
            }
        }
    );
};

// CustomAlert helpers

function confirmTitle (title) {
    // there's a bug in customalert.js preventing us from
    // using a custom title unless we also specify text for
    // the ok and cancel buttons
    return {
        title: localizer.localize(title),
        done: localizer.localize('Ok'),
        cancel: localizer.localize('Cancel')
    };
}
