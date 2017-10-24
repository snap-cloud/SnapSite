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
    /*
    SnapCloud.getThumbnail(
        project.username,
        project.projectname,
        function (thumbnail) {
            div.querySelector('img').src = thumbnail;
        },
        function (thumbnail) {
            div.querySelector('img').classList.add('no-image');
        }
    );
    */

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
