// Tiny Discourse module.
// Just the stuff we need for the blog and comments

DiscourseAPI = {
    url: 'https://forum.snap.berkeley.edu',
    fetchJSON: function (path, callback, errorString) {
        var req = new XMLHttpRequest();
        req.open('GET', DiscourseAPI.url + path +
            '?random=' + Math.random(1000));
        req.onreadystatechange = function () {
            var jsonResponse;
            if (req.readyState === 4) {
                if (req.status === 200 || req.status == 0) {
                    try {
                        jsonResponse = JSON.parse(req.responseText);
                        callback.call(null, jsonResponse);
                    } catch (err) {
                        genericError(err, errorString);
                    }
                }
            }
        };
        req.send(null); 
    }
};

function DiscourseBlog (category, element) {
    this.init(category, element);
};

DiscourseBlog.prototype.init = function (category, element) {
    this.category = category;
    this.element = element;
    this.fetchPosts();
};

DiscourseBlog.prototype.fetchPosts =  function () {
    var myself = this;
    DiscourseAPI.fetchJSON(
        '/c/' + this.category + '.json',
        function (jsonResponse) {
            jsonResponse.topic_list.topics.slice(1).sort(
                function (a, b) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
            ).forEach(
                function (each) {
                    var postDiv = document.createElement('div');
                    myself.element.appendChild(postDiv);
                    DiscourseAPI.fetchJSON(
                        '/t/' + each.id + '.json',
                        function (postJSON) {
                            myself.renderPost(
                                {
                                    title: postJSON.title,
                                    date: new Date(postJSON.created_at),
                                    author: postJSON.details.created_by.username,
                                    content: postJSON.post_stream.posts[0].cooked,
                                    commentsURL: DiscourseAPI.url + '/t/' +
                                        each.id + '/2'
                                },
                                postDiv
                            );
                        },
                        'Could not fetch post'
                    );
                }
            );
        },
        'Could not fetch post list'
    );
};

DiscourseBlog.prototype.renderPost = function (post, postDiv) {
    var titleHeader = document.createElement('h1'),
        dateSpan = document.createElement('span'),
        contentsDiv = document.createElement('div'),
        separatorSpan = document.createElement('span'),
        commentsAnchor = document.createElement('a');

    postDiv.classList.add('post');
    titleHeader.classList.add('title');
    dateSpan.classList.add('date');
    contentsDiv.classList.add('contents');
    separatorSpan.classList.add('separator');
    commentsAnchor.classList.add('comments');

    titleHeader.innerText = post.title;
    dateSpan.innerHTML = formatDate(post.date);
    contentsDiv.innerHTML = post.content;
    commentsAnchor.innerText = localizer.localize('Discuss this in the forum');
    commentsAnchor.href = post.commentsURL;
    contentsDiv.appendChild(separatorSpan);
    contentsDiv.appendChild(commentsAnchor);

    [titleHeader, authorSpan(post.author), dateSpan, contentsDiv].forEach(
        function (element) { postDiv.appendChild(element); }
    );
};

// Project comments functionality

function DiscourseComments (user, project, element) {
    this.init(user, project, element);
};

DiscourseComments.prototype.init = function (user, project, element) {
    this.user = user;
    this.project = project;
    this.element = element;
    this.fetchComments();
};

DiscourseComments.prototype.fetchComments = function () {
    var myself = this;
    DiscourseAPI.fetchJSON(
        '/c/project-comments/' + encodeURIComponent(this.user) + '.json',
        function (jsonResponse) {
            var commentsTopic =
                jsonResponse.topic_list.topics.find(
                    function (each) {
                        return encodeURIComponent(each.title) ==
                            encodeURIComponent(myself.project);
                    }
                );
            if (commentsTopic) {
                DiscourseAPI.fetchJSON(
                    '/t/' + commentsTopic.id + '/posts.json',
                    function (comments) {
                        comments.post_stream.posts.forEach(
                            function (commentJSON) {
                                var commentDiv = document.createElement('div');
                                commentDiv.classList.add('comment');
                                myself.element.appendChild(commentDiv);
                                myself.renderComment(
                                    {
                                        date: new Date(commentJSON.created_at),
                                        author: commentJSON.username,
                                        content: commentJSON.cooked
                                    },
                                    commentDiv
                                );
                            }
                        );
                    }
                );
            }
        }
    );
};

DiscourseComments.prototype.renderComment = function (comment, commentDiv) {
    var dateSpan = document.createElement('span'),
        contentsDiv = document.createElement('div'),
        separatorSpan = document.createElement('span');

    dateSpan.classList.add('date');
    contentsDiv.classList.add('contents');
    separatorSpan.classList.add('separator');

    dateSpan.innerHTML = formatDate(comment.date);
    contentsDiv.innerHTML = comment.content;

    // Remove forbidden HTML tags
    ['img','script','iframe', 'style'].forEach(
        function (tag) {
            contentsDiv.querySelectorAll(tag).forEach(
                function (element) { element.remove(); }
            );
        }
    );

    // Flatten all possible HTML in the contents
    contentsDiv.querySelectorAll('*').forEach(
        function (element) {
            var newSpan = document.createElement('span');
            newSpan.innerHTML = element.innerText;
            element.parentElement.replaceChild(newSpan, element);
        }
    );

    [userAnchor(comment.author), contentsDiv, dateSpan, separatorSpan].forEach(
        function (element) { commentDiv.appendChild(element); }
    );
};
