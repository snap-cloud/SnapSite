function newProjectDiv (project, options) {
    return itemDiv(
        project, 'project', 'username', 'projectname', 'notes', options)
};

function newCollectionDiv (collection, options) {
    return itemDiv(
        collection, 'collection', 'creator.username', 'name', 'description',
        options)
};

function itemDiv (item, itemType, ownerUsernamePath, nameField,
        descriptionField, options) {
    var extraFields = options['extraFields'],
        div = document.createElement('div');

    if (!item.thumbnail) {
        div.innerHTML = '<i class="no-image fas ' +
            (itemType == 'collection' ? 'fa-briefcase' : 'fa-question-circle') +
            '"></i>'
    }

    div.innerHTML +=
        '<a href="' + itemType +
        '?user=' + encodeURIComponent(eval('item.' + ownerUsernamePath)) +
        '&' + itemType + '=' + encodeURIComponent(item[nameField]) +
        '"><img class="thumbnail" alt="' +
        (item.thumbnail ? escapeHtml(item[nameField]) : '') +
        '" title="' + escapeHtml(item[descriptionField]) +
        (item.thumbnail ? '" src="' + item.thumbnail  + '"' : '') +
        '"><span class="' + itemType + '-name">' + escapeHtml(item[nameField]) +
        '</span></a>';

    if (extraFields) {
        Object.keys(extraFields).forEach(function (fieldName) {
            var attribute = extraFields[fieldName];
            div.appendChild(
                window[fieldName + 'Span'](eval('item.' + attribute)));
        });
    }

    div.classList.add(itemType, options['size']);

    if (options['gridSize']) {
        div.classList.add('pure-u-1-' + options['gridSize']);
    };

    if (options['withCollectionControls'] && ownsOrIsAdmin(item)) {
        // Adds controls to remove this project from a collection or choose it
        // as a thumbnail
        div.appendChild(collectionControls(item));
    }

    return div;
};

function fillProjectTitle(project, titleElement) {
    var h1 = titleElement.querySelector('h1');
    h1.innerHTML = project.projectname;
    if (canRename(project)) {
        new InPlaceEditor(
            h1,
            function () {
                SnapCloud.updateProjectName(
                    pageProject(),
                    h1.textContent,
                    function () {
                        location.href = 'project.html?user=' +
                            project.username + '&project=' +
                            h1.textContent
                    },
                    genericError
                );
            })
    }
    titleElement.append(authorSpan(project.username));
};

function fillProjectNotes (project, notesElement) {
    notesElement.innerHTML =
        project.notes ||
            '<small>' +
                localizer.localize('This project has no notes') +
                '</small>';

    // In-place notes editor
    if (canEditNotes(project)) {
        new InPlaceEditor(
            notesElement,
            function () {
                SnapCloud.updateNotes(
                    pageProject(),
                    notesElement.textContent,
                    function () {
                        if (notesElement.textContent == '') {
                            notesElement.innerHTML = '<small>' +
                                localizer.localize(
                                    'This project has no notes') + '</small>';
                        }
                    },
                    genericError
                );
            }
        );
    }
};

function fillProjectDates (project, datesElement) {
    document.querySelector('.created').innerHTML =
        localizer.localize('Created on') + ' ' + formatDate(project.created);
    document.querySelector('.updated').innerHTML =
        localizer.localize('Last updated on') +
            ' ' + formatDate(project.lastupdated);

    if (project.ispublic) {
        document.querySelector('.shared').hidden = false;
        document.querySelector('.shared').innerHTML =
            localizer.localize(', shared on') + ' ' +
            formatDate(project.lastshared);
        if (project.ispublished) {
            document.querySelector('.published').hidden = false;
            document.querySelector('.published').innerHTML =
                localizer.localize(', published on') + ' ' +
                formatDate(project.firstpublished);
        } else {
            document.querySelector('.published').hidden = true;
        }
        document.querySelector('.is-public').innerHTML =
            'This project is public' +
            (project.ispublished ? ' and listed' : ' but unlisted');
    } else {
        document.querySelector('.shared').hidden = true;
        document.querySelector('.published').hidden = true;
        document.querySelector('.is-public').innerHTML =
            'This project is private';
    }
};

function fillRemixInfo (project, infoElement) {
    if (project.remixedfrom) {
        infoElement.innerHTML = localizer.localize('(remixed from ');
        if (project.remixedfrom.projectname) {
            infoElement.append(
                projectSpan(
                    project.remixedfrom.username,
                    project.remixedfrom.projectname));
            infoElement.append(authorSpan(project.remixedfrom.username));
        } else {
            infoElement.append('a project that no longer exists');
        }
        infoElement.innerHTML += ')';
    }
};

function setProjectButtonVisibility (project, buttonsElement) {
    buttonsElement.querySelector('.buttons .share').hidden =
        project.ispublic || !canShare(project);
    buttonsElement.querySelector('.buttons .unshare').hidden =
        !project.ispublic || !canShare(project);
    buttonsElement.querySelector('.buttons .publish').hidden =
        (!project.ispublic || project.ispublished) ||
            !canPublish(project) || sessionStorage.role === 'banned';
    buttonsElement.querySelector('.buttons .unpublish').hidden =
        (!project.ispublic || !project.ispublished) || !canUnpublish(project);
    buttonsElement.querySelector('.embed-button').hidden = !project.ispublic;
    buttonsElement.querySelector('.buttons .collect').hidden =
        !project.ispublished || !ownsOrIsAdmin(project);
    // why whould you want to flag your own project?
    buttonsElement.querySelector('.buttons .flag').hidden = owns(project);
    buttonsElement.querySelector('.buttons .delete').hidden =
        !canDelete(project);
};

function loadProjectFrame (project, placeholder) {
    function doLoadIt () {
        var iframe = document.createElement('iframe');
        iframe.height = 406;
        iframe.src = projectURL(project.username, project.projectname) +
            '&embedMode&noExitWarning&noRun';
        placeholder.parentNode.replaceChild(iframe, placeholder);
    }
    if (document.visibilityState == 'visible') {
        doLoadIt();
    } else {
        document.addEventListener('visibilitychange', function() {
            doLoadIt();
            document.removeEventListener('visibilitychange');
        });
    }
};

function collectionControls (project) {
    var controls = document.createElement('div'),
        removeAnchor = document.createElement('a'),
        thumbnailAnchor = document.createElement('a');

    controls.classList.add('collection-controls');

    removeAnchor.classList.add('clickable');
    removeAnchor.innerHTML = '<i class="fas fa-times-circle"></i>';
    removeAnchor.onclick = function () {
        confirmRemoveFromCollection(project);
    };
    controls.appendChild(removeAnchor);

    if (!(getUrlParameter('collection') == 'Flagged' &&
            getUrlParameter('user') == 'snapcloud')) {
        // Flagged collection doesn't have a thumbnail
        thumbnailAnchor.classList.add('clickable');
        thumbnailAnchor.innerHTML = '<i class="fas fa-image"></i>';
        thumbnailAnchor.onclick = function () {
            chooseAsThumbnailForCollection(project);
        };
        controls.appendChild(thumbnailAnchor);
    }

    return controls;
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

function chooseAsThumbnailForCollection (project) {
    SnapCloud.setCollectionThumbnail(
        getUrlParameter('user'),
        getUrlParameter('collection'),
        project.id,
        function () { location.reload(); },
        genericError
    );
};

// Could probably refactor these. Not sure it's worth the hassle though.
function confirmRemoveFromCollection (project) {
    confirm(
        localizer.localize(
            'Are you sure you want to remove this project from the collection?'
        ),
        function (ok) {
            if (ok) {
                SnapCloud.removeProjectFromCollection(
                    getUrlParameter('user'),
                    getUrlParameter('collection'),
                    project.id,
                    function () { location.reload(); },
                    genericError
                );
            }
        },
        confirmTitle('Share project')
    );
};

function confirmShareProject (project, buttonsDiv, datesDiv) {
    confirm(
        localizer.localize('Are you sure you want to share this project?'),
        function (ok) {
            if (ok) {
                SnapCloud.shareProject(
                    project.projectname,
                    project.username,
                    function () {
                        alert(
                            localizer.localize(
                                'You can now access this project at:') +
                                '<br><a href="' + location.href + '">' +
                                location.href + '</a>',
                            { title: localizer.localize('Project shared') },
                            function () {
                                project.ispublic = true;
                                setProjectButtonVisibility(project, buttonsDiv);
                                fillProjectDates(project, datesDiv);
                            }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Share project')
    );
};

function confirmShareCollection (collection, buttonsDiv, datesDiv) {
    confirm(
        localizer.localize('Are you sure you want to share this collection?'),
        function (ok) {
            SnapCloud.shareCollection(
                collection.creator.username,
                collection.name,
                function () {
                    alert(
                        localizer.localize(
                            'This collection can now be accessed at:') +
                            '<br><a href="' + location.href + '">' +
                            location.href + '</a>',
                        { title: localizer.localize('Collection shared') },
                        function () {
                            collection.ispublic = true;
                            setCollectionButtonVisibility(collection,
                                    buttonsDiv);
                            fillCollectionDates(collection, datesDiv);
                        }
                    );
                },
                genericError
            );
        },
        confirmTitle('Share collection')
    );
};

function confirmUnshareProject (project, buttonsDiv, datesDiv) {
    confirm(
        localizer.localize(
            'Are you sure you want to stop sharing this project?'),
        function (ok) {
            if (ok) {
                SnapCloud.unshareProject(
                    project.projectname,
                    project.username,
                    function () {
                        alert(
                            localizer.localize('This project is now private.'),
                            { title: localizer.localize('Project unshared') },
                            function () {
                                project.ispublic = false;
                                project.ispublished = false;
                                setProjectButtonVisibility(project, buttonsDiv);
                                fillProjectDates(project, datesDiv);
                            }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Unshare project')
    );
};

function confirmUnshareCollection (collection, buttonsDiv, datesDiv) {
    confirm(
        localizer.localize(
            'Are you sure you want to stop sharing this collection?'),
        function (ok) {
            if (ok) {
                SnapCloud.unshareCollection(
                    collection.creator.username,
                    collection.name,
                    function () {
                        alert(
                            localizer.localize(
                                'This collection is now private.'),
                            {
                                title:
                                    localizer.localize('Collection unshared')
                            },
                            function () {
                                collection.ispublic = false;
                                collection.ispublished = false;
                                setCollectionButtonVisibility(collection,
                                    buttonsDiv);
                                fillCollectionDates(collection, datesDiv);
                            }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Unshare collection')
    );
};

function confirmPublishProject (project, buttonsDiv, datesDiv) {
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
                            localizer.localize(
                                'This project is now listed in the ' +
                                    'Snap<em>!</em> site.'),
                            { title: localizer.localize('Project published') },
                            function () {
                                project.ispublished = true;
                                setProjectButtonVisibility(project, buttonsDiv);
                                fillProjectDates(project, datesDiv);
                            }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Publish project')
    );
};

function confirmPublishCollection (collection, buttonsDiv, datesDiv) {
    confirm(
        localizer.localize(
            'Are you sure you want to publish this collection<br>' +
            'and make it visible in the Snap<em>!</em> website?'),
        function (ok) {
            if (ok) {
                SnapCloud.publishCollection(
                    collection.creator.username,
                    collection.name,
                    function () {
                        alert(
                            localizer.localize(
                                'This collection is now listed in the ' +
                                    'Snap<em>!</em> site.'),
                            { title:
                                localizer.localize('Collection published') },
                            function () {
                                collection.ispublished = true;
                                setCollectionButtonVisibility(collection,
                                    buttonsDiv);
                                fillCollectionDates(collection, datesDiv);
                            }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Publish collection')
    );
};

function confirmUnpublishProject (project, buttonsDiv, datesDiv) {
    function done () {
        alert(
            localizer.localize(
                'This project is not listed in the Snap<em>!</em> site anymore.'
            ),
            { title: localizer.localize('Project unpublished') },
            function () {
                project.ispublished = false;
                setProjectButtonVisibility(project, buttonsDiv);
                fillProjectDates(project, datesDiv);
            }
        );
    };

    confirm(
        localizer.localize(
            'Are you sure you want to unpublish this project<br>' +
            'and hide it from the Snap<em>!</em> website?'),
        function (ok) {
            if (ok) {
                if (sessionStorage.username !== project.username) {
                    reasonDialog(
                        project,
                        function (reason) {
                            SnapCloud.withCredentialsRequest(
                                'POST',
                                '/projects/' +
                                    encodeURIComponent(project.username) + '/' +
                                    encodeURIComponent(project.projectname) +
                                    '/metadata?ispublished=false&reason=' +
                                    encodeURIComponent(reason),
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

function confirmUnpublishCollection (collection, buttonsDiv, datesDiv) {
    function done () {
        alert(
            localizer.localize(
                'This collection is not listed in the ' +
                    'Snap<em>!</em> site anymore.'),
            { title: localizer.localize('Collection unpublished') },
            function () {
                collection.ispublished = false;
                setCollectionButtonVisibility(collection, buttonsDiv);
                fillCollectionDates(collection, datesDiv);
            }
        );
    };

    confirm(
        localizer.localize(
            'Are you sure you want to unpublish this collection<br>' +
            'and hide it from the Snap<em>!</em> website?'),
        function (ok) {
            if (ok) {
                if (sessionStorage.username !== collection.creator.username) {
                    reasonDialog(
                        collection,
                        function (reason) {
                            SnapCloud.withCredentialsRequest(
                                'POST',
                                '/users/' +
                                    encodeURIComponent(
                                        collection.creator.username) +
                                    '/collections/' +
                                    encodeURIComponent(collection.name) +
                                    '/metadata?ispublished=false&reason=' +
                                    encodeURIComponent(reason),
                                done,
                                genericError,
                                'Could not unpublish collection'
                            );
                        }
                    );
                } else {
                    SnapCloud.unpublishCollection(
                        collection.creator.username,
                        collection.name,
                        done,
                        genericError
                    );
                }
            }
        },
        confirmTitle('Unpublish collection')
    );
};

function confirmDeleteProject (project) {
    function done () {
        alert(
            localizer.localize('This project has been deleted.'),
            { title: localizer.localize('Project deleted') },
            function () {
                location.href =
                    (sessionStorage.username !== project.username)
                        ? 'index'
                        : 'my_projects';
            }
        );
    };

    confirm(
        localizer.localize('Are you sure you want to delete this project?') +
        '<br>' + '<i class="warning fa fa-exclamation-triangle"></i> ' +
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
                                '/projects/' +
                                    encodeURIComponent(project.username) + '/'
                                    + encodeURIComponent(project.projectname) +
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

function confirmDeleteCollection (collection) {
    function done () {
        alert(
            localizer.localize('This collection has been deleted.'),
            { title: localizer.localize('Collection deleted') },
            function () {
                location.href =
                    (sessionStorage.username !== collection.creator.username)
                        ? 'index'
                        : 'my_collections';
            }
        );
    };

    confirm(
        localizer.localize('Are you sure you want to delete this collection?')
        + '<br>' +
        '<i class="warning fa fa-exclamation-triangle"></i> ' +
        localizer.localize('WARNING! This action cannot be undone!') +
        ' <i class="warning fa fa-exclamation-triangle"></i>',
        function (ok) {
            if (ok) {
                if (sessionStorage.username !== collection.creator.username) {
                    reasonDialog(
                        collection,
                        function (reason) {
                            SnapCloud.withCredentialsRequest(
                                'DELETE',
                                '/users/' +
                                    encodeURIComponent(
                                        collection.creator.username) +
                                    '/collections/' +
                                    encodeURIComponent(collection.name) +
                                    '?reason=' + encodeURIComponent(reason),
                                done,
                                genericError,
                                'Could not delete collection'
                            );
                        }
                    );
                } else {
                    SnapCloud.deleteCollection(
                        collection.creator.username,
                        collection.name,
                        done,
                        genericError
                    );
                }
            }
        },
        confirmTitle('Delete collection')
    );
};

function confirmFlagProject (project) {
    confirm(
        localizer.localize(
            'Are you sure you want to flag this project as inappropriate?'),
        function (ok) {
            if (ok) {
                SnapCloud.addProjectToCollection(
                    'snapcloud',
                    'Flagged',
                    project.username,
                    project.projectname,
                    function () {
                        alert(
                            localizer.localize(
                                'This project has been flagged.'),
                            { title: localizer.localize('Project flagged') }
                        );
                    },
                    genericError
                );
            }
        },
        confirmTitle('Flag project')
    );
};

function owns (item) {
    return sessionStorage.username == (item.username || item.creator.username);
};

function ownsOrIsAdmin (item) {
    // Not to worry. Actual secure permission check is performed in the backend.
    return owns(item) || sessionStorage.role === 'admin';
};

function canShare (item) {
    return ownsOrIsAdmin(item);
};

function canPublish (item) {
    return ownsOrIsAdmin(item);
};

function canRename (item) {
    return ownsOrIsAdmin(item);
};

function canEditNotes (item) {
    return ownsOrIsAdmin(item);
};

function canEditDescription (collection) {
    return ownsOrIsAdmin(collection);
};
function canUnpublish (item) {
    return (sessionStorage.username ==
        (item.username || item.creator.username)) ||
        [ 'admin', 'moderator', 'reviewer' ].indexOf(sessionStorage.role) > -1;
};

function canDelete (item) {
    return (sessionStorage.username ==
        (item.username || item.creator.username)) ||
        [ 'admin', 'moderator' ].indexOf(sessionStorage.role) > -1;
};

function reasonDialog (item, onSuccess) {
    var itemType = item.owner ? 'collection' : 'project',
        itemName = item.owner ? item.name : item.projectname,
        form = document.createElement('form'),
        reasons = {
            hack: 'Your ' + itemType + ' <strong>' + itemName + '</strong>' +
                    ' was trying to exploit a security vulnerability.',
            coc: 'Your ' + itemType + ' <strong>' + itemName + '</strong>' +
                    ' has been found to violate the <a href="' + baseURL +
                    '/coc">Code of Conduct</a>' +
                    ' of the Snap<em>!</em> community website.',
            dmca: 'Your ' + itemType + ' <strong>' + itemName + '</strong>' +
                    ' has been found to violate the <a href="' + baseURL +
                    '/dmca">DMCA policy</a>' +
                    ' of the Snap<em>!</em> community website.'
        };
    form.classList.add('reasons');
    new Map([
        [ 'hack', localizer.localize('Security vulnerability') ],
        [ 'coc', localizer.localize('Code of Conduct violation') ],
        [ 'dmca', localizer.localize('DMCA violation') ]
    ]).forEach(function (value, key) {
        form.innerHTML +=
            '<span class="option"><input type="radio" name="reason" value="' +
            key + '"><label for="' + key +'">' + value + '</label></span>';
    });
    dialog(
        'Please choose a reason',
        form,
        function () {
            onSuccess.call(
                this,
                reasons[
                    form.querySelector('input[name="reason"]:checked').value]
            );
        }
    );
};

function embedDialog (project) {
    var codeArea = document.createElement('textarea'),
        form = document.createElement('form');

    form.classList.add('embed-options');
    form.innerHTML =
            '<span class="info">' + localizer.localize(
                'Please select the elements you wish to include in the '+
                'embedded project viewer:') + '</span>';

    new Map([
        [ 'title', localizer.localize('Project title') ],
        [ 'author', localizer.localize('Project author') ],
        [ 'edit-button', localizer.localize('Edit button') ]
    ]).forEach(function (value, key) {
        form.innerHTML += '<span class="option"><input type="checkbox" name="' +
            key + '" value="' + key + '" checked><label for="' + key +'">' +
            value + '</label></span>';
    });
    form.appendChild(codeArea);

    codeArea.classList.add('embed-code');
    codeArea.set = function () {
        codeArea.value =
            '<iframe frameBorder=0 src="' + baseURL + '/embed?project=' +
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

function collectProject (project) {
    // Add this project to a user's collection
    // TODO get all collections where user has write permission

    var form = document.createElement('form'),
        collections;

    form.classList.add('collect-form');
    form.innerHTML =
        '<p class="info">' +
        localizer.localize('Please select the collection to which you want ' +
        'to add this project:') + '</p>';

    SnapCloud.getUserCollections(
        null, // username is implicit
        null, // page
        null, // pageSize
        null, // searchTerm
        function (response) {
            collections = response.collections;
            if (collections[0]) {
                collections.forEach(function (collection) {
                    form.innerHTML +=
                        '<p class="option"><input type="radio" ' +
                        'name="collection" value="' + collection.name +
                        '"><label> ' + collection.name + '</label></p>';
                });
            } else {
                form.innerHTML = '<p>' +
                    localizer.localize('You do not have any collections.') +
                    '</p>';
            }
            doneLoading('.collect-form');
        },
        genericError
    );

    dialog(
        'Add project to collection',
        form,
        function () {
            var collection = collections.find(
                    function(collection) {
                        return collection.name ===
                            form.querySelector(
                                'input[name="collection"]:checked').value;
                    }
            );
            SnapCloud.addProjectToCollection(
                collection.creator.username,
                collection.name,
                project.username,
                project.projectname,
                function () {
                    alert(
                        localizer.localize('Project added to collection') + '.',
                        { title:
                            localizer.localize('Project added to collection') }
                    );
                },
                genericError
            );
        },
        nop,
        function () { beganLoading('.collect-form'); } // onOpen
    );

};

function toggleFullScreen () {
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

function runProject (event) {
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

function stopProject () {
    var iframe = document.querySelector('.embed iframe'),
        ide = iframe.contentWindow.world.children[0];
    ide.stopAllScripts();
    if (ide.embedOverlay) {
        ide.embedOverlay.destroy();
        ide.embedPlayButton.destroy();
    }
};
