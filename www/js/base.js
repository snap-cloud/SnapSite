function readFile (file, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', file, true);
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200 || request.status == 0) {
                callback(request.responseText);
            }
        }
    };
    request.send(null);
};

function render (templateName, elementSelector, data) {
   readFile('templates/' + templateName + '.html', function (content) {
       document.querySelector(elementSelector).innerHTML = (new t(content)).render(data);
   }); 
};
