function newProjectDiv (project, options) {
    var thumbnail = project.thumbnail.toString(),
        extraFields = options['extraFields'],
        div = document.createElement('div');

    div.innerHTML = 
        '<a href="project.html?user=' + project.loginName + '&project=' + 
        project.projectName + '"><img alt="' + project.projectName + 
        '" title="' + project.projectDescription + '" src=' + thumbnail +
        '><span class="project-name">' + project.projectName + '</span></a>';

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

function binaryToXML (binary) {
    var parser = new DOMParser(),
        xml = parser.parseFromString(binary.toString(), 'text/xml');
    return xml;
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
