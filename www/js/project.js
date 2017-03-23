function newProjectDiv (project, options) {
    var thumbnail = project.thumbnail.toString(),
        div = document.createElement('div');

    div.innerHTML = 
        '<a href="project.html?user=' + project.loginName + '&project=' + 
        project.projectName + '"><img alt="' + project.projectName + 
        '" title="' + project.projectDescription + '" src=' + thumbnail +
        '><span class="project-name">' + project.projectName + '</span></a>';

    div.appendChild(newAuthorSpan(project.loginName));

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
    // Some projects are missing the pentrails and costumes. Weird...
    var blob = new Blob([project.sourceCode], {type: 'application/octet-binary'});
    saveAs(blob, project.projectName + '.xml');
};
