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
    var button = document.createElement('div');
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
    return userButton(user, 'Block', nop, 'pure-button-warning');
};

makeAdmin = function (user) {
    return userButton(user, 'Make Admin', nop);
};

becomeButton = function (user) {
    return userButton(user, 'Become', nop);
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
    buttonsDiv.appendChild(blockButton(user));
    buttonsDiv.appendChild(becomeButton(user));
    buttonsDiv.appendChild(makeAdmin(user));

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

    userWrapperDiv.appendChild(userDiv);
    return userWrapperDiv;
}
