SnapAPI.relogin = function () {
    var myself = this;
    return new Promise(function (resolve, reject) {
        if (localStorage["username"]) {
            myself.setUser(localStorage["username"], localStorage["password"])
                .then(resolve)
                .catch(reject)
        } else {
            reject();
        }
    });
};

SnapAPI.logout = function () {
    this.clearUser()
    localStorage["username"] = null;
    localStorage["password"] = null;
    window.location.href = "index.html";
};
