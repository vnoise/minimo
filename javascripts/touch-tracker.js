var TouchTracker = {
    touchModel: null,

    init: function(root) {
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
            this.touchModel = "mouse";
            this.event = {
                down: 'mousedown',
                move: 'mousemove',
                up: 'mouseup'
            };
        }

        // document.documentElement.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
        // document.documentElement.style.webkitTouchCallout = "none";

        // document.onselectstart = function () { return false; };
        // document.onselect = function () { return false; };

        // document.ongesturechange = function(e) { e.preventDefault(); };
        // document.ongesturestart = function(e) { e.preventDefault(); };

        this.root = root;
        this.offset = $(this.root.svg.root()).offset();
        
        document.addEventListener(this.event.down, this.onTouchDown.bind(this), false);
    },

    createEvent :function(widget, event) {
        return {
            localX: event.pageX - this.offset.left - widget.pageX(),
            localY: event.pageY - this.offset.top - widget.pageY()
        };
    },

    eventInside: function(widget, event) {
        var x = event.pageX - this.offset.left - widget.pageX();
        var y = event.pageY - this.offset.top - widget.pageY();

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
        if (!this.processDown(widget, event)) {
            if (widget.parent) {
                this.bubbleEvent(widget, event);
            }
        }
    },

    handleEvent: function(widget, method, event) {
        return widget[method].call(widget, this.createEvent(widget, event));
    },

    processDown: function(widget, event) {
        if (!this.handleEvent(widget, "onTouchDown", event)) {
            return false;
        }

        this.onTouchMoveHandler = this.onTouchMove.bind(this, widget);
        this.onTouchUpHandler = this.onTouchUp.bind(this, widget);

        document.addEventListener(this.event.move, this.onTouchMoveHandler, false);
        document.addEventListener(this.event.up, this.onTouchUpHandler, false);

        event.preventDefault();

        return true;
    },

    findTargetAndBubble: function(event) {
        var target = this.findTarget(this.root, event);

        console.log(target);

        if (target) {
            this.bubbleEvent(target, event);
        }       
    },

    onTouchDown: function(event) {
        if (event.targetTouches) {
            for (var i = 0; i < event.targetTouches.length; i++) {
                this.findTargetAndBubble(event.targetTouches[i]);
            }
        }
        else {
            this.findTargetAndBubble(event);
        }
    },

    onTouchMove: function(widget, event) {
        this.handleEvent(widget, "onTouchMove", event);
        event.preventDefault();
        return false;
    },

    onTouchUp: function(widget, event) {
        this.handleEvent(widget, "onTouchMove", event);

        document.removeEventListener(this.event.move, this.onTouchMoveHandler, false);
        document.removeEventListener(this.event.up, this.onTouchUpHandler, false);

        event.preventDefault();
    }
};