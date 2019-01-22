function dialog (title, body, onSuccess) {
    // I reuse CustomAlert's dialogs
    var dialogBox = document.querySelector('#customalert'),
        bodyDiv = document.querySelector('.body');
    bodyDiv.innerHTML = '';
    bodyDiv.appendChild(body);
    dialogBox.querySelector('.header').innerHTML = localizer.localize(title);
    dialogBox.querySelector('.button-done').innerHTML = localizer.localize('Ok');
    document.querySelector('#customalert-overlay').style.display = 'block';
    dialogBox.style.display = 'block';
    customalert.done = function () {
        document.querySelector('#customalert').style.display = null;
        document.querySelector('#customalert-overlay').style.display = null;
        document.querySelector('html').style.overflow = 'auto';
        if (onSuccess) { onSuccess.call(this); }
    };
};
