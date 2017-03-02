function getUrlParameter (param) {
    var regex = new RegExp('[?&]' + param + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

function pageUser () {
    return getUrlParameter('user');
};

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

// Error handling

function genericError (errorString) {
    return new Promise(function (resolve, reject) {
        alert(
           errorString,
           { title: 'Error'},
           resolve
           );
    });
    
};
