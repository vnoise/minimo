function TouchTracker(component, element, callback) {
    this.component = component;
    this.element = element;
    this.callback = callback;

    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);

    this.element.addEventListener('MozTouchDown', this.onDown.bind(this), false);
    // this.element.addEventListener('mousedown', this.onDown.bind(this), false);

    this.element.addEventListener('mousedown', function(e) { e.preventDefault(); }, false);
};

TouchTracker.prototype.onDown = function(event) {
    document.addEventListener(event.streamId ? 'MozTouchMove' : 'mousemove', this.onMove, false);
    document.addEventListener(event.streamId ? 'MozTouchUp' : 'mouseup', this.onUp, false);

    this.streamId = event.streamId;
    this.callback(event, true);

    event.preventDefault();
    return false;
};

TouchTracker.prototype.onMove = function(event) {
    if (event.streamId && event.streamId != this.streamId) {
        return;
    }

    this.callback(event, false);

    event.preventDefault();
    return false;
};

TouchTracker.prototype.onUp = function(event) {
    if (event.streamId && event.streamId != this.streamId) {
        return;
    }

    this.streamId = null;

    document.removeEventListener(event.streamId ? 'MozTouchMove' : 'mousemove', this.onMove, false);
    document.removeEventListener(event.streamId ? 'MozTouchUp' : 'mouseup', this.onUp, false);

    event.preventDefault();
};