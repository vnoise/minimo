var TouchTracker = {
    active: null,
    onDown: null,
    components: [],
    active: [],

    init: function(svg) {
        this.svg = svg;
        this.offset = $(this.svg.root()).offset();

        this.svg.root().addEventListener('mousedown', this.onDown.bind(this), false);
        // this.svg.root().addEventListener('MozTouchDown', this.onDown.bind(this), false);
        this.svg.root().ontouchstart = this.onDown.bind(this);        
    },

    add: function(component) {
        this.components.push(component);
        this.active = this.components;
    },

    createEvent :function(component, event) {
        return {
            localX: event.pageX - this.offset.left - component.x,
            localY: event.pageY - this.offset.top - component.y
        };
    },

    onDown: function(event) {
        for (var i = 0; i < this.active.length; i++) {
            if (this.processDown(this.active[i], event)) {
                return false;
            }
        }
    },

    eventInside: function(component, event) {
        return event.localX >= 0 && 
            event.localX <= component.width &&
            event.localY >= 0 && 
            event.localY <= component.height;
    },

    handleEvent: function(component, originalEvent, first) {
        var event = this.createEvent(component, originalEvent);

        if (this.eventInside(component, event)) {
            return (component.handleEvent(event, first));
        }
        else {
            return false;
        }
    },

    processDown: function(component, event) {
        if (event.targetTouches) {
            for (var i = 0; i < event.targetTouches.length; i++) {
                if (!this.handleEvent(component, event.targetTouches[i], true)) {
                    return false;
                }
            }
        }
        else {
            if (!this.handleEvent(component, event, true)) {
                return false;
            }
        }

        this.onMoveHandler = this.onMove.bind(this, component);
        this.onUpHandler = this.onUp.bind(this, component);

        document.addEventListener('mousemove', this.onMoveHandler, false);
        document.addEventListener('mouseup', this.onUpHandler, false);
        document.addEventListener(event.streamId ? 'MozTouchMove' : 'touchmove', this.onMoveHandler, false);
        document.addEventListener(event.streamId ? 'MozTouchUp' : 'touchend', this.onUpHandler, false);

        event.preventDefault();

        return true;
    },

    onMove: function(component, event) {
        if (event.targetTouches) {
            for (var i = 0; i < event.targetTouches.length; i++) {
                this.handleEvent(component, event.targetTouches[i], false);               
            }
        }
        else {
            this.handleEvent(component, event, false);
        }

        event.preventDefault();
        return false;
    },

    onUp: function(component, event) {
        document.removeEventListener('mousemove', this.onMoveHandler, false);
        document.removeEventListener(event.streamId ? 'MozTouchMove' : 'touchmove', this.onMoveHandler, false);
        document.removeEventListener(event.streamId ? 'MozTouchUp' : 'touchend', this.onUpHandler, false);

        event.preventDefault();
    }
};