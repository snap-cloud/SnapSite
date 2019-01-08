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
    confirm(
        localizer.localize('Are you sure you want to unpublish this project<br>' + 
            'and hide it from the Snap<em>!</em> website?'),
        function (ok) {
            if (ok) {
                SnapCloud.unpublishProject(
                    project.projectname,
                    project.username,
                    function () {
                        alert(
                            localizer.localize('This project is not listed in the Snap<em>!</em> site anymore.'),
                            { title: localizer.localize('Project unpublished') },
                            function () { location.reload() }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Unpublish project')
    );
};

function confirmDelete (project) {
    confirm(
        localizer.localize('Are you sure you want to delete this project?') + '<br>' + 
            '<i class="warning fa fa-exclamation-triangle"></i> ' +
            localizer.localize('WARNING! This action cannot be undone!') +
            ' <i class="warning fa fa-exclamation-triangle"></i>',
        function (ok) {
            if (ok) {
                SnapCloud.deleteProject(
                    project.projectname,
                    project.username,
                    function () {
                        alert(
                            localizer.localize('This project has been deleted.'),
                            { title: localizer.localize('Project deleted') },
                            function () { location.href = 'myprojects.html'; }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Delete project')
    );
};

function ownsProject (project) {
    // Not to worry. Actual secure permission check is performed in the backend.
    // sessionStorage stringifies everything, so we need to check against the 'true' string.
    return (sessionStorage.username == project.username) || sessionStorage.isadmin === 'true';
};

function embedDialog (project) {
    // I show a dialog with a bunch of options and display an HTML string
    // one can paste into a website to embed the project as an iframe
    // I reuse CustomAlert's dialogs, and my code is hideous
    var dialogBox = document.querySelector('#customalert'),
        codeArea = document.createElement('textarea'),
        bodyDiv = document.querySelector('.body'),
        bodyContent = 
            '<span>' + localizer.localize('Please select the elements you wish ' + 
            'to include in the embedded project viewer:') + '</span><br><form class="embed-options">';
    new Map([
        [ 'title', localizer.localize('Project title') ],
        [ 'author', localizer.localize('Project author') ],
        [ 'edit-button', localizer.localize('Edit button') ]
    ]).forEach(function (value, key) {
        bodyContent += '<span><input type="checkbox" name="' + key + '" value="' + key +
            '" checked><label for="' + key +'">' + value + '</label></span>';
    });
    bodyContent += '</form>';
    bodyDiv.innerHTML = bodyContent;
    bodyDiv.appendChild(codeArea);

    codeArea.classList.add('embed-code');
    codeArea.set = function () {
        var form = bodyDiv.querySelector('form');
        codeArea.value = 
            '<iframe frameBorder=0 src="' + location.origin + '/embed.html?project=' +
            project.projectname + '&user=' + project.username +
            (form.elements['title'].checked ? '&showTitle=true' : '') +
            (form.elements['author'].checked ? '&showAuthor=true' : '') +
            (form.elements['edit-button'].checked ? '&editButton=true' : '') +
            '" width="480" height="390"></iframe>';
    };
    codeArea.set();

    bodyDiv.querySelectorAll('input').forEach(function (input) {
        input.onchange = function () { codeArea.set(); }
    });

    dialogBox.querySelector('.header').innerHTML = localizer.localize('Embed Options');
    dialogBox.querySelector('.button-done').innerHTML = localizer.localize('Ok');
    document.querySelector('html').style.overflow = 'hidden';
    document.querySelector('#customalert-overlay').style.display = 'block';
    dialogBox.style.display = 'block';
    customalert.done = function() {
        document.querySelector('#customalert').style.display = null;
        document.querySelector('#customalert-overlay').style.display = null;
        document.querySelector('html').style.overflow = 'auto';
    }
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

function runProject() {
    var iframe = document.querySelector('.embed iframe'),
        ide = iframe.contentWindow.world.children[0];
    ide.runScripts();
    if (ide.embedOverlay) {
        ide.embedOverlay.destroy();
        ide.embedPlayButton.destroy();
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
