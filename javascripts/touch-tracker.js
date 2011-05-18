var TouchTracker = new Class({
    touchModel: null,
    streams: {},

    initialize: function(root, svg) {
        if (window.location.hash == '#touch') {
            if (navigator.userAgent.match(/iPad|iPhone/i)) {
                this.touchModel = "apple";
                this.event = {
                    down: 'touchstart',
                    move: 'touchmove',
                    up: 'touchend'
                };
            }
            else if (navigator.userAgent.match(/Firefox/i)) {
                document.multitouchData = true;
                this.touchModel = "mozilla";
                this.event = {
                    down: 'MozTouchDown',
                    move: 'MozTouchMove',
                    up: 'MozTouchUp'
                };
            }
            else {
                throw "no touch device found";
            }
        }
        else {
            this.touchModel = "mouse";
            this.event = {
                down: 'mousedown',
                move: 'mousemove',
                up: 'mouseup'
            };
        }

        // document.documentElement.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
        // document.documentElement.style.webkitTouchCallout = "none";

        document.onselectstart = function () { return false; };
        document.onselect = function () { return false; };

        document.ongesturechange = function(e) { e.preventDefault(); };
        document.ongesturestart = function(e) { e.preventDefault(); };

        this.root = root;
        this.svg = svg;
        
        document.addEventListener(this.event.down, this.onTouchDown.bind(this), false);
        document.addEventListener(this.event.move, this.onTouchMove.bind(this), false);
        document.addEventListener(this.event.up, this.onTouchUp.bind(this), false);

        this.scrollManager = new ScrollManager();
    },

    createEvent :function(widget, event) {
        return {
            localX: event.pageX - widget.pageX(),
            localY: event.pageY - widget.pageY()
        };
    },

    eventInside: function(widget, event) {
        var x = event.pageX - widget.pageX();
        var y = event.pageY - widget.pageY();

        return x >= 0 && x <= widget.width() && y >= 0 && y <= widget.height();
    },

    findTarget: function(widget, event) {
        if (this.eventInside(widget, event)) {
            for (var i = widget.children.length - 1; i >= 0; i--) {
                var target = this.findTarget(widget.children[i], event);
                if (target) {
                    return target;
                }
            }
            return widget;
        }

        return false;
    },

    bubbleEvent: function(widget, event) {
        if (this.handleEvent(widget, "onTouchDown", event)) { 
            this.streams[event.streamId == null ? 1 : event.streamId] = widget;
        }
        else {
            if (widget.parent) {
                this.bubbleEvent(widget, event);
            }
        }
    },

    handleEvent: function(widget, method, event) {
        return widget[method].call(widget, this.createEvent(widget, event));
    },

    findTargetAndBubble: function(event) {
        var target = this.findTarget(this.root, event);

        if (target && target.parent) {
            this.bubbleEvent(target, event);
        }
        else {
            this.scrollManager.onTouchDown(event);
        }
    },

    onTouchDown: function(event) {
        event.preventDefault();

        if (event.targetTouches) {
            for (var i = 0; i < event.targetTouches.length; i++) {
                var e = event.targetTouches[i];
                e.streamId = i;
                this.findTargetAndBubble(e);
            }
        }
        else {
            this.findTargetAndBubble(event);
        }

        return false;
    },

    onTouchMove: function(event) {
        event.preventDefault();

        var widget = this.streams[event.streamId == null ? 1 : event.streamId];

        if (widget) {
            this.handleEvent(widget, "onTouchMove", event);
        }

        return false;
    },

    onTouchUp: function(event) {
        event.preventDefault();

        var widget = this.streams[event.streamId == null ? 1 : event.streamId];

        if (widget) {
            this.handleEvent(widget, "onTouchUp", event);
        }

        delete this.streams[event.streamId == null ? 1 : event.streamId];

        return false;
    }
});