// Blog
// needs markdown.js to be loaded before

function Blog (element) {
    this.init(element);
};

Blog.prototype.init = function (element) {
    var myself = this;
    this.element = element;
    this.baseUrl = 'https://raw.githubusercontent.com/snap-cloud/blog-contents/master/'; 
    this.getPostList(function (posts) {
        posts.forEach(function (postName) {
            myself.renderPost(postName);
        });
    });
};

Blog.prototype.getFile = function (fileName, callback) {
    var req = new XMLHttpRequest(),
        myself = this;
    req.open('GET', this.baseUrl + fileName + '?random=' + Math.random(1000));
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200 || req.status == 0) {
                beganLoading();
                callback.call(myself, req.responseText);
                doneLoading();
            }
        }
    };
    req.send(null);
};

Blog.prototype.getPostList = function (callback) {
    var myself = this;
    this.getFile(
        'INDEX',
        function (contents) {
            callback.call(myself, contents.split('\n').slice(0, -1));
        }
    );
};

Blog.prototype.renderPost = function (postName) {
    var postDiv = document.createElement('div'),
        contentsDiv = document.createElement('div'),
        dateDiv = document.createElement('span');
    postDiv.classList.add('post');
    dateDiv.classList.add('date');
    contentsDiv.classList.add('contents');
    dateDiv.innerHTML = formatDate(postName.slice(0, -3) + 'T00:00');
    postDiv.appendChild(contentsDiv);
    this.element.appendChild(postDiv);
    this.getFile(postName, function (contents) {
        var title;
        contentsDiv.innerHTML = markdown.toHTML(contents);
        title = contentsDiv.querySelector('h1');
        title.after(dateDiv);
    });
};
