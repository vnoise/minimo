var Slider = new Class({
    Extends: Widget,

    initialize: function(options) {
        this.value = 0;
        Widget.prototype.initialize.call(this, options);
        this.handleWidth = 20;
    },

    draw: function() {
        this.attr('class', 'slider');

        this.rect(0, 0, this.width(), this.height(), { rx: 5, ry: 5 });
        this.text(2, this.height() / 2 + 5, this.key.slice(0, 5), { 'class': 'label' });
        this.handle = this.rect(0, 0, this.width(), this.handleWidth, { 'class': 'handle', rx: 5, ry: 5 });

        this.setHandlePosition();
    },

    setHandlePosition: function() {
        var position = 
            (this.height() - this.handleWidth) * 
            ((this.value - this.min) / (this.max - this.min));

        if (this.handle) {
            this.handle.setAttribute('y', this.height() - this.handleWidth - position);
        }
    },

    setValue: function(value) {
        this.value = Math.max(this.min, Math.min(this.max, value));
        this.setHandlePosition();
    },

    handleEvent: function(event) {    
        var value = this.min + ((this.height() - event.localY) / this.height()) * (this.max - this.min);

        value = Math.floor(value / this.step) * this.step;      

        if (value != this.value) {
            this.setValue(value);
            this.instrument.send('/parameter', 'sf', this.key, this.value);
        }
    },

    onTouchDown: function(event) {
        this.handleEvent(event);
        return true;
    },

    onTouchMove: function(event) {
        this.handleEvent(event);
        return true;
    }
});

var ToggleButton = new Class({
    Extends: Widget,

    initialize: function(options) {
        Widget.prototype.initialize.call(this, options);
        this.active = true;
    },

    draw: function() {
        this.attr('class', 'menu-button');
        this.rect(0, 0, this.width(), this.height(), 0, 0);
        this.text(5, this.height() / 2 + 4, this.label, { 'class': 'label' });
    },

    toggle: function() {
        this.active = !this.active;
        this.callback(this);
    },

    onTouchDown: function(event) {
        this.toggle();
        return true;
    }
});
