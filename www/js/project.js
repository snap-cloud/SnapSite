function projectDiv (project, options) {
    var zeroIndex = project.thumbnail.findIndex(function(e) { return e === 0} ), // Remove trailing zeroes. To be fixed in the backend.
        thumbnail = (zeroIndex > -1 ? project.thumbnail.slice(0, zeroIndex) : project.thumbnail).toString(), 
        div = document.createElement('div');

    div.classList.add('project', options['size']);

    if (options['gridSize']) {
        div.classList.add('pure-u-1-' + options['gridSize']);
    };

    div.innerHTML = 
        '<a href="project.html?user=' + project.loginName + '&projectName=' + 
            project.projectName + '"><img src=' + thumbnail + '><span class="project-name">' +
            project.projectName + '</span></a><span class="author">by <a href="user.html?user=' + 
            project.loginName + '"><strong>' + project.loginName + '</strong></a></span>';

    return div;
};
