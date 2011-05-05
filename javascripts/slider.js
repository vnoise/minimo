function Slider(options) {
    this.value = 0;

    Widget.call(this, options);

    this.handleWidth = 20;
}

Slider.prototype = {
    __proto__: Widget.prototype,

    draw: function() {
        this.attr('class', 'slider');

        this.rect(0, 0, this.width(), this.height(), 5, 5);
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
};


function SliderPanel(options) {
    Widget.call(this, options);
}

SliderPanel.prototype = {
    __proto__: Widget.prototype,

    draw: function() {
        var x = 0;
        var y = 0;
        var w = this.width() / this.children.length;
        var h = this.height();

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].extent(x, y, w, h).draw();
            x += w;
        }
    }
};
