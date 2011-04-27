var TouchTracker = {
    active: null,
    onDown: null,
    widgets: [],
    active: [],

    init: function(svg) {
        this.svg = svg;
        this.offset = $(this.svg.root()).offset();

        // this.svg.root().addEventListener('mousedown', this.onDown.bind(this), false);
        // this.svg.root().addEventListener('MozTouchDown', this.onDown.bind(this), false);
        // this.svg.root().ontouchstart = this.onDown.bind(this);
        // this.svg.root().addEventListener('mousedown', function(e) { e.preventDefault(); }, false);
    },

    add: function(widget) {
        this.widgets.push(widget);
        this.active = this.widgets;

        widget.canvas.addEventListener('mousedown', this.onTouchDown.bind(this, widget), false);
    },

    createEvent :function(widget, event) {
        return {
            localX: event.pageX - this.offset.left - widget.pageX(),
            localY: event.pageY - this.offset.top - widget.pageY()
        };
    },

    onDown: function(event) {
        for (var i = 0; i < this.active.length; i++) {
            if (this.processDown(this.active[i], event)) {
                return false;
            }
        }
    },

    eventInside: function(widget, event) {
        return event.localX >= 0 && 
            event.localX <= widget.width() &&
            event.localY >= 0 && 
            event.localY <= widget.height();
    },

    handleEvent: function(widget, originalEvent, first) {
        var event = this.createEvent(widget, originalEvent);

        if (this.eventInside(widget, event)) {
            return (widget.handleEvent(event, first));
        }
        else {
            return false;
        }
    },

    processDown: function(widget, event) {
        if (event.targetTouches) {
            for (var i = 0; i < event.targetTouches.length; i++) {
                if (!this.handleEvent(widget, event.targetTouches[i], true)) {
                    return false;
                }
            }
        }
        else {
            if (!this.handleEvent(widget, event, true)) {
                return false;
            }
        }

        this.onMoveHandler = this.onMove.bind(this, widget);
        this.onUpHandler = this.onUp.bind(this, widget);

        document.addEventListener('mousemove', this.onMoveHandler, false);
        document.addEventListener('mouseup', this.onUpHandler, false);
        document.addEventListener(event.streamId ? 'MozTouchMove' : 'touchmove', this.onMoveHandler, false);
        document.addEventListener(event.streamId ? 'MozTouchUp' : 'touchend', this.onUpHandler, false);

        event.preventDefault();

        return true;
    },

    onTouchDown: function(widget, _event) {
        var event = this.createEvent(widget, _event);

        widget.handleEvent(event, true);

        this.onMoveHandler = this.onTouchMove.bind(this, widget);
        this.onUpHandler = this.onTouchUp.bind(this, widget);

        document.addEventListener('mousemove', this.onMoveHandler, false);
        document.addEventListener('mouseup', this.onUpHandler, false);

        _event.preventDefault();

        return true;
    },

    onTouchMove: function(widget, _event) {
        var event = this.createEvent(widget, _event);

        widget.handleEvent(event, false);

        _event.preventDefault();
        return false;
    },

    onTouchUp: function(widget, event) {
        document.removeEventListener('mousemove', this.onMoveHandler, false);
        document.removeEventListener('mouseup', this.onUpHandler, false);

        event.preventDefault();
    },

    onMove: function(widget, event) {
        if (event.targetTouches) {
            for (var i = 0; i < event.targetTouches.length; i++) {
                this.handleEvent(widget, event.targetTouches[i], false);               
            }
        }
        else {
            this.handleEvent(widget, event, false);
        }

        event.preventDefault();
        return false;
    },

    onUp: function(widget, event) {
        document.removeEventListener('mousemove', this.onMoveHandler, false);
        document.removeEventListener(event.streamId ? 'MozTouchMove' : 'touchmove', this.onMoveHandler, false);
        document.removeEventListener(event.streamId ? 'MozTouchUp' : 'touchend', this.onUpHandler, false);

        event.preventDefault();
    }
};