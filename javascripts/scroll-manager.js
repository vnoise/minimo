function ScrollManager() {
    this.lastX = 0;
    this.lastY = 0;
    this.streamId = 0;

    document.addEventListener("MozTouchUp",   this.onTouchUp.bind(this), false);
    // document.addEventListener("MozTouchDown", this.onTouchDown.bind(this), false);
    document.addEventListener("MozTouchMove", this.onTouchMove.bind(this), false);
}

ScrollManager.prototype = {

    isScrollArea: function(event) {
        return (this.streamId == 0 || this.streamId == event.streamId) && 
            (event.target.localName == 'body' || event.target.localName == 'html');
    },

    onTouchDown: function (event) {
        this.lastX = event.pageX;
        this.lastY = event.pageY;
        this.streamId = event.streamId;
    },

    onTouchMove: function (event) {
        if (this.streamId == event.streamId) {
            // log("" + event.clientX + " : " + event.clientY);

            var x = this.lastX - event.pageX;
            var y = this.lastY - event.pageY;

            this.scrollBy(x, y);
            
            this.lastX = event.pageX;
            this.lastY = event.pageY;
        }
    },

    scrollBy: function (x, y) {
        // if (timeout) {
        //     clearTimeout(timeout);
        // }

        window.scrollBy(Math.ceil(x), Math.ceil(y));

        // if (Math.abs(x) > 0.05 || Math.abs(y) > 0.05) {
        //     var timeout = setTimeout(scrollBy.bind(this, x * 0.7, y * 0.7), 50);
        // }
    },

    onTouchUp: function (event) {
        if (this.streamId == event.streamId) {
            this.streamId = 0;
        }
    }

};
