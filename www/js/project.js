function newProjectDiv (project, options) {
    var extraFields = options['extraFields'],
        div = document.createElement('div');

    div.innerHTML = 
        '<a href="project.html?user=' + project.username + '&project=' + 
        project.projectname + '"><img alt="' + project.projectname + 
        '" title="' + project.projectDescription + '"><span class="project-name">' +
        project.projectname + '</span></a>';

    SnapCloud.getThumbnail(
        project.projectname,
        function (thumbnail) {
            div.querySelector('img').src = thumbnail;
        },
        function (thumbnail) {
            div.querySelector('img').classList.add('no-image');
        }
    );

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
    var xml, blob;
    
    if (project.media.sourceCode.length > 0) {
        xml = '<snapdata>' + 
            project.sourceCode.toString() +
            project.media.sourceCode.toString() +
            '</snapdata>'
    } else {
        xml = project.sourceCode.toString();
    }

    blob = new Blob([xml], {type: 'text/xml'});

    saveAs(blob, project.projectName + '.xml');
};
