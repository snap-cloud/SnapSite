snapURL = location.protocol + '//snap.berkeley.edu/snapsource/snap.html';

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
    var visitor = SnapAPI.currentUser();
    if (visitor) {
        document.querySelectorAll('.visitor').forEach(function (each) {
            each.innerHTML = visitor;
        });
    }
};

function fillUsernameFields () {
    var username = pageUser();
    if (username) {
        document.querySelectorAll('.username').forEach(function (each) {
            each.innerHTML = username;
        });
    }
};

function setTitle (newTitle) {
    document.title = newTitle;
};

// Element creation

function newAuthorSpan (author) {
    var span = document.createElement('span');
    span.classList.add('author');
    span.innerHTML = 'by <a href="user.html?user=' + author + '"><strong>' + author + '</strong></a>';
    return span;
};

function projectURL (author, project) {
    return snapURL + '#present:Username=' + author + '&ProjectName=' + project;
};

// Data conversion

function formatDate (aDate) {
    return aDate.toLocaleString(
        navigator.language || 'en-us',
        { month: 'long', day: '2-digit', year: 'numeric' }
    );
};

// Error handling

function genericError (errorString) {
    doneLoading();
    return new Promise(function (resolve, reject) {
        alert(
           errorString,
           { title: 'Error'},
           resolve
           );
    });
};

// Graphic goodies

function beganLoading () {
    document.querySelector('#loading').hidden = false;
};

function doneLoading () {
    document.querySelector('#loading').hidden = true;
};
