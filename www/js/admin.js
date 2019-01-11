getUserList = function (query, pageSize, page, callback) {
    SnapCloud.withCredentialsRequest(
        'GET',
        '/users?' +
            (query ? 'matchtext=' + encodeURIComponent(query) + '&' : '' ) +
            'pagesize=' + pageSize + '&page=' + page,
        callback,
        genericError,
        'Could not fetch user list'
    );
}

userButton = function (user, label, action, extraClass) {
    var button = document.createElement('a');
    button.classList.add('pure-button');
    button.classList.add(label.toLowerCase().replace(/\s/g,''));
    if (extraClass) {
        button.classList.add(extraClass);
    }
    button.innerHTML = localizer.localize(label);
    button.onclick = action;
    return button;
}

verifyButton = function (user) {
    return userButton(
        user,
        'Verify',
        function () {
            SnapCloud.withCredentialsRequest(
                'GET',
                '/users/' + encodeURIComponent(user.username) + '/verify_user/0', // token is irrelevant for admins
                function (response) {
                    alert(
                        response,
                        function () {
                            location.href = 'user.html?user=' + encodeURIComponent(user.username);
                        }
                    );
                },
                genericError,
                'Could not verify user'
            );
        }
    );
};

blockButton = function (user) {
    return userButton(user, 'Block', function () { alert('not yet implemented'); }, 'pure-button-warning');
};

deleteButton = function (user) {
    return userButton(
        user,
        'Delete',
        function () {
            confirm(
                localizer.localize('Are you sure you want to delete the user') + ' <strong>' + user.username + '</strong>?<br>' +
                '<i class="warning fa fa-exclamation-triangle"></i> ' +
                localizer.localize('WARNING! This action cannot be undone!') +
                ' <i class="warning fa fa-exclamation-triangle"></i>',
                function (ok) {
                    if (ok) {
                       SnapCloud.withCredentialsRequest(
                           'DELETE',
                           '/users/' + encodeURIComponent(user.username),
                           function (response) {
                               alert(
                                   response,
                                   function () { location.reload(); }
                               );
                           },
                           genericError,
                           'Could not delete user'
                       );
                    }
                },
                confirmTitle('Delete user')
            );
        },
        'pure-button-warning'
    );
};

becomeButton = function (user) {
    return userButton(
        user,
        'Become',
        function () {
            SnapCloud.login(
                user.username,
                0, // password is irrelevant
                false, // persist
                function (username, isadmin, response) {
                    alert(
                        response.message,
                        function () {
                            sessionStorage.username = username;
                            sessionStorage.isadmin = isadmin;
                            location.href = 'profile.html';
                        }
                    );
                },
                genericError
            );
        }
    );
};

userDiv = function (user) {
    var userWrapperDiv = document.createElement('div'),
        userDiv = document.createElement('div'),
        usernameAnchor = userAnchor(user.username),
        emailSpan = document.createElement('span'),
        idSpan = document.createElement('span'),
        joinedSpan = document.createElement('span'),
        buttonsDiv = document.createElement('div');

    emailSpan.innerHTML = '<em><a target="_blank" href="mailto:' + user.email + '">' + user.email + '</a></em>';
    idSpan.innerHTML = '<strong>id:</strong> ' + user.id;
    joinedSpan.innerHTML = '<strong localizable>Joined in </strong>' + formatDate(user.created);

    userWrapperDiv.classList.add('user');
    userWrapperDiv.classList.add('pure-u-1-3');
    userDiv.classList.add('details');

    buttonsDiv.classList.add('buttons');

    [usernameAnchor, emailSpan, idSpan, joinedSpan, buttonsDiv].forEach(function (e) { userDiv.appendChild(e); });

    if (user.isadmin) {
        userDiv.classList.add('admin');
        userDiv.title += localizer.localize('Administrator') + '\n';
    }

    if (!user.verified) {
        buttonsDiv.appendChild(verifyButton(user));
        userDiv.classList.add('unverified');
        userDiv.title += localizer.localize('User is not verified');
    }

    buttonsDiv.appendChild(becomeButton(user));
    buttonsDiv.appendChild(blockButton(user));
    buttonsDiv.appendChild(deleteButton(user));

    userWrapperDiv.appendChild(userDiv);
    return userWrapperDiv;
}
