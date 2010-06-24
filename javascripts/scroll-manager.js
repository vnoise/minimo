function ScrollManager() {
    this.lastX = 0;
    this.lastY = 0;
    this.streamId = 0;

    document.addEventListener("MozTouchUp",   this.onTouchUp.bind(this), false);
    document.addEventListener("MozTouchDown", this.onTouchDown.bind(this), false);
    document.addEventListener("MozTouchMove", this.onTouchMove.bind(this), false);
}

ScrollManager.prototype.onTouchDown = function (event) {
    if (event.target.localName == 'html') {
        this.lastX = event.pageX;
        this.lastY = event.pageY;
        this.streamId = event.streamId;
    }
};

ScrollManager.prototype.onTouchMove = function (event) {
    if (event.target.localName == 'html' && event.streamId == streamId) {
        // log("" + event.clientX + " : " + event.clientY);

        var x = this.lastX - event.pageX;
        var y = this.lastY - event.pageY;

        this.scrollBy(x, y);
        
        this.lastX = event.pageX;
        this.lastY = event.pageY;
    }
};

ScrollManager.prototype.scrollBy = function (x, y) {
    // if (timeout) {
    //     clearTimeout(timeout);
    // }

    window.scrollBy(Math.ceil(x), Math.ceil(y));

    // if (Math.abs(x) > 0.05 || Math.abs(y) > 0.05) {
    //     var timeout = setTimeout(scrollBy.bind(this, x * 0.7, y * 0.7), 50);
    // }
};

ScrollManager.prototype.onTouchUp = function (event) {
    if (event.target.localName == 'html') {
        if (event.streamId == streamId) {
            this.streamId = null;
        }
    }
};
