function dialog (title, body, onSuccess, onCancel) {
    // I reuse CustomAlert's dialogs
    var dialogBox = onCancel
            ? document.querySelector('#customconfirm')
            : document.querySelector('#customalert'),
        bodyDiv = dialogBox.querySelector('.body');

    bodyDiv.innerHTML = '';
    bodyDiv.appendChild(body);

    dialogBox.querySelector('.header').innerHTML = localizer.localize(title);
    dialogBox.querySelector('.button-done').innerHTML = localizer.localize('Ok');

    if (onCancel) {
        dialogBox.querySelector('.button-cancel').innerHTML = localizer.localize('Cancel');
    }

    document.querySelector('#customalert-overlay').style.display = 'block';
    dialogBox.style.display = 'block';

    function close () {
        dialogBox.style.display = null;
        document.querySelector('#customalert-overlay').style.display = null;
        document.querySelector('html').style.overflow = 'auto';
    };

    dialogBox.done = function () {
        close();
        if (onSuccess) { onSuccess.call(this); }
    };

    dialogBox.cancel = function () {
        close();
        if (onCancel) { onCancel.call(this); }
    };
};
