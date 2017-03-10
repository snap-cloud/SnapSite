function newProjectDiv (project, options) {
    var thumbnail = sanitizeBinary(project.thumbnail).toString(),
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

function sanitizeBinary (binary) {
    // Remove trailing zeroes. To be fixed in the backend.
    var zeroIndex = binary.findIndex(function (c) { return c === 0; });
    return (zeroIndex > -1 ?
        binary.slice(0, zeroIndex) :
        binary);
};

function binaryToXML (binary) {
    var parser = new DOMParser(),
        xml = parser.parseFromString(sanitizeBinary(binary).toString(), 'text/xml');
    return xml;
};

function downloadProject (project) {
    // Some projects are missing the pentrails and costumes, even after sanitizing their binaries.
    // Weird...
    var blob = new Blob([sanitizeBinary(project.sourceCode)], {type: 'application/octet-binary'});
    saveAs(blob, project.projectName + '.xml');
};
