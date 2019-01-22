function newProjectDiv (project, options) {
    var extraFields = options['extraFields'],
        div = document.createElement('div');

    div.innerHTML =
        '<a href="project.html?user=' + encodeURIComponent(project.username) + '&project=' +
        encodeURIComponent(project.projectname) + '"><img alt="' + escapeHtml(project.projectname) +
        '" title="' + escapeHtml(project.notes) + '" src="' + project.thumbnail +
        '"><span class="project-name">' + escapeHtml(project.projectname) + '</span></a>';

    if (!project.thumbnail) {
        div.querySelector('img').classList.add('no-image');
    }

    if (extraFields) {
        Object.keys(extraFields).forEach(function (fieldName) {
            var attribute = extraFields[fieldName];
            div.appendChild(window[fieldName + 'Span'](project[attribute]));
        });
    }

    div.classList.add('project', options['size']);

    if (options['gridSize']) {
        div.classList.add('pure-u-1-' + options['gridSize']);
    };

    return div;
};

function downloadProject (project) {
    SnapCloud.getPublicProject(
        project.projectname,
        project.username,
        function (contents) {
            var blob = new Blob([contents], {type: 'text/xml'});
            saveAs(blob, project.projectname + '.xml');
        },
        function (response) {
            genericError(response.errors[0], 'Could not fetch project');
        }
    );
};

// Could probably refactor these. Not sure it's worth the hassle though.

function confirmShareProject (project) {
    confirm(
        localizer.localize('Are you sure you want to share this project?'),
        function (ok) {
            if (ok) {
                SnapCloud.shareProject(
                    project.projectname,
                    project.username,
                    function () {
                        alert(
                            localizer.localize('You can now access this project at:') +
                            '<br><a href="' + projectURL(project.username, project.projectname) + '">' +
                            projectURL(project.username, project.projectname) + '</a>',
                            { title: localizer.localize('Project shared') },
                            function () { location.reload() }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Share project')
    );
};

function confirmUnshareProject (project) {
    confirm(
        localizer.localize('Are you sure you want to stop sharing this project?'),
        function (ok) {
            if (ok) {
                SnapCloud.unshareProject(
                    project.projectname,
                    project.username,
                    function () {
                        alert(
                            localizer.localize('This project is now private.'),
                            { title: localizer.localize('Project unshared') },
                            function () { location.reload() }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Unshare project')
    );
};

function confirmPublish (project) {
    confirm(
        localizer.localize('Are you sure you want to publish this project<br>' +
            'and make it visible in the Snap<em>!</em> website?'),
        function (ok) {
            if (ok) {
                SnapCloud.publishProject(
                    project.projectname,
                    project.username,
                    function () {
                        alert(
                            localizer.localize('This project is now listed in the Snap<em>!</em> site.'),
                            { title: localizer.localize('Project published') },
                            function () { location.reload() }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Publish project')
    );
};

function confirmUnpublish (project) {
    function done () {
        alert(
            localizer.localize('This project is not listed in the Snap<em>!</em> site anymore.'),
            { title: localizer.localize('Project unpublished') },
            function () { location.reload(); }
        );
    };

    confirm(
        localizer.localize('Are you sure you want to unpublish this project<br>' +
            'and hide it from the Snap<em>!</em> website?'),
        function (ok) {
            if (ok) {
                if (sessionStorage.username !== project.username) {
                    reasonDialog(
                        project,
                        function (reason) {
                            SnapCloud.withCredentialsRequest(
                                'POST',
                                '/projects/' + encodeURIComponent(project.username) +
                                '/' + encodeURIComponent(project.projectname) +
                                '/metadata?ispublished=false&reason=' + encodeURIComponent(reason),
                                done,
                                genericError,
                                'Could not unpublish project'
                            );
                        }
                    );
                } else {
                    SnapCloud.unpublishProject(
                        project.projectname,
                        project.username,
                        done,
                        genericError
                    );
                }
            }
        },
        confirmTitle('Unpublish project')
    );
};

function confirmDelete (project) {
    function done () {
        alert(
            localizer.localize('This project has been deleted.'),
            { title: localizer.localize('Project deleted') },
            function () {
                location.href =
                    (sessionStorage.username !== project.username)
                        ? 'index.html'
                        : 'myprojects.html';
            }
        );
    };

    confirm(
        localizer.localize('Are you sure you want to delete this project?') + '<br>' +
        '<i class="warning fa fa-exclamation-triangle"></i> ' +
        localizer.localize('WARNING! This action cannot be undone!') +
        ' <i class="warning fa fa-exclamation-triangle"></i>',
        function (ok) {
            if (ok) {
                if (sessionStorage.username !== project.username) {
                    reasonDialog(
                        project,
                        function (reason) {
                            SnapCloud.withCredentialsRequest(
                                'DELETE',
                                '/projects/' + encodeURIComponent(project.username) +
                                '/' + encodeURIComponent(project.projectname) +
                                '?reason=' + encodeURIComponent(reason),
                                done,
                                genericError,
                                'Could not delete project'
                            );
                        }
                    );
                } else {
                    SnapCloud.deleteProject(
                        project.projectname,
                        project.username,
                        done,
                        genericError
                    );
                }
            }
        },
        confirmTitle('Delete project')
    );
};

function ownsProjectOrIsAdmin (project) {
    // Not to worry. Actual secure permission check is performed in the backend.
    return (sessionStorage.username == project.username) || sessionStorage.role === 'admin';
};

function canShare (project) {
    return ownsProjectOrIsAdmin(project);
};

function canPublish (project) {
    return ownsProjectOrIsAdmin(project);
};

function canRename (project) {
    return ownsProjectOrIsAdmin(project);
};

function canEditNotes (project) {
    return ownsProjectOrIsAdmin(project);
};

function canUnpublish (project) {
    return (sessionStorage.username == project.username) ||
        [ 'admin', 'moderator', 'reviewer' ].indexOf(sessionStorage.role) > -1;
};

function canDelete (project) {
    return (sessionStorage.username == project.username) ||
        [ 'admin', 'moderator' ].indexOf(sessionStorage.role) > -1;
};

function reasonDialog (project, onSuccess) {
    var form = document.createElement('form'),
        reasons = {
            hack: 'Your project <strong>' + project.projectname + '</strong>' +
                    ' was trying to exploit a security vulnerability.',
            coc: 'Your project <strong>' + project.projectname + '</strong>' +
                    ' has been found to violate the <a href="' + baseURL + '/coc.html">Code of Conduct</a>' +
                    ' of the Snap<em>!</em> community website.',
            dmca: 'Your project <strong>' + project.projectname + '</strong>' +
                    ' has been found to violate the <a href="' + baseURL + '/dmca.html">DMCA policy</a>' +
                    ' of the Snap<em>!</em> community website.' 
        };
    form.classList.add('reasons');
    new Map([
        [ 'hack', localizer.localize('Security vulnerability') ],
        [ 'coc', localizer.localize('Code of Conduct violation') ],
        [ 'dmca', localizer.localize('DMCA violation') ]
    ]).forEach(function (value, key) {
        form.innerHTML += '<span class="option"><input type="radio" name="reason" value="' + key +
            '"><label for="' + key +'">' + value + '</label></span>';
    });
    dialog(
        'Please choose a reason',
        form,
        function () {
            onSuccess.call(
                this,
                reasons[form.querySelector('input[name="reason"]:checked').value]
            );
        }
    );
}; 

function embedDialog (project) {
    var codeArea = document.createElement('textarea'),
        form = document.createElement('form');
    
    form.classList.add('embed-options');
    form.innerHTML =
            '<span class="info">' + localizer.localize('Please select the elements you wish ' +
            'to include in the embedded project viewer:') + '</span>';

    new Map([
        [ 'title', localizer.localize('Project title') ],
        [ 'author', localizer.localize('Project author') ],
        [ 'edit-button', localizer.localize('Edit button') ]
    ]).forEach(function (value, key) {
        form.innerHTML += '<span class="option"><input type="checkbox" name="' + key + '" value="' + key +
            '" checked><label for="' + key +'">' + value + '</label></span>';
    });
    form.appendChild(codeArea);

    codeArea.classList.add('embed-code');
    codeArea.set = function () {
        codeArea.value =
            '<iframe frameBorder=0 src="' + baseURL + '/embed.html?project=' +
            project.projectname + '&user=' + project.username +
            (form.elements['title'].checked ? '&showTitle=true' : '') +
            (form.elements['author'].checked ? '&showAuthor=true' : '') +
            (form.elements['edit-button'].checked ? '&editButton=true' : '') +
            '" width="480" height="390"></iframe>';
    };
    codeArea.set();

    form.querySelectorAll('input').forEach(function (input) {
        input.onchange = function () { codeArea.set(); }
    });

    dialog('Embed Options', form);
};


function toggleFullScreen() {
    var embed = document.querySelector('.embed'),
        iframe = document.querySelector('.embed iframe');
    if (embed.fullScreen) {
        embed.fullScreen = false;
        embed.style = embed.oldStyle;
        iframe.style = iframe.oldStyle;
        document.body.style.overflow = 'auto';
    } else {
        embed.fullScreen = true;
        embed.oldStyle = embed.style;
        iframe.oldStyle = iframe.style;
        embed.style.position = 'fixed';
        embed.style.left = 0;
        embed.style.top = 0;
        embed.style.width = '100vw';
        embed.style.height = '100vh';
        iframe.style.height = '100%';
        document.body.style.overflow = 'hidden';
    }
    embed.focus();
};

function runProject(event) {
    var iframe = document.querySelector('.embed iframe'),
        startButton = document.querySelector('.start-button'),
        ide = iframe.contentWindow.world.children[0];
    if (event.shiftKey) {
        ide.toggleFastTracking();
        if (startButton.classList.contains('fa-flag')) {
            startButton.classList.replace('fa-flag', 'fa-bolt');
        } else {
            startButton.classList.replace('fa-bolt', 'fa-flag');
        }
    } else {
        ide.runScripts();
        if (ide.embedOverlay) {
            ide.embedOverlay.destroy();
            ide.embedPlayButton.destroy();
        }
    }
};

function stopProject() {
    var iframe = document.querySelector('.embed iframe'),
        ide = iframe.contentWindow.world.children[0];
    ide.stopAllScripts();
    if (ide.embedOverlay) {
        ide.embedOverlay.destroy();
        ide.embedPlayButton.destroy();
    }
};
