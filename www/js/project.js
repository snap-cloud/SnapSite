function newProjectDiv (project, options) {
    var extraFields = options['extraFields'],
        div = document.createElement('div');

    div.innerHTML = 
        '<a href="project.html?user=' + project.username + '&project=' + 
        project.projectname + '"><img alt="' + project.projectname + 
        '" title="' + project.notes + '" src="' + project.thumbnail +
        '"><span class="project-name">' + project.projectname + '</span></a>';

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
    });
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
                            function () { location.href = '/myprojects.html'; }
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
