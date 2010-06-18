function TouchTracker(component, element, callback) {
    this.component = component;
    this.element = element;
    this.callback = callback;

    this.onMove = this.onMove.bind(this);
    this.onUp = this.onUp.bind(this);

    this.element.addEventListener('moztouchdown', this.onDown.bind(this), false);
    this.element.addEventListener('mousedown', this.onDown.bind(this), false);
};

TouchTracker.prototype.onDown = function(event) {
    document.addEventListener(event.streamId ? 'moztouchmove' : 'mousemove', this.onMove, false);
    document.addEventListener(event.streamId ? 'moztouchup' : 'mouseup', this.onUp, false);

    this.streamId = event.streamId;
    this.callback(event, true);

    event.preventDefault();
};

TouchTracker.prototype.onMove = function(event) {
    if (event.streamId && event.streamId != this.streamId) {
        return;
    }

    this.callback(event, false);

    event.preventDefault();
};

TouchTracker.prototype.onUp = function(event) {
    document.removeEventListener(event.streamId ? 'moztouchmove' : 'mousemove', this.onMove, false);
    document.removeEventListener(event.streamId ? 'moztouchup' : 'mouseup', this.onUp, false);    
};