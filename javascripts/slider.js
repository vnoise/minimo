function Slider(options) {
    Widget.call(this, options);

    this.handleWidth = 20;
}

$.extend(Slider.prototype, {
    __proto__: Widget.prototype,

    draw: function() {
        this.attr('class', 'slider');

        this.rect(0, 0, this.width(), this.height(), 5, 5);
        this.text(2, this.height() / 2 + 5, this.key.slice(0, 5), { 'class': 'label' });
        this.handle = this.rect(0, 0, this.width(), this.handleWidth, 5, 5, { 'class': 'handle' });

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
            if (Math.abs(this.value - value) > 0.05) {
                this.setValue(value);
                this.instrument.send('/parameter', 'sf', this.key, this.value);
            }
        }
    },

    onTouchDown: function(event) {
        this.handleEvent(event);
    },

    onTouchMove: function(event) {
        this.handleEvent(event);
    }
});


function SliderPanel(options) {
    Widget.call(this, options);
}

$.extend(SliderPanel.prototype, {
    __proto__: Widget.prototype,

    draw: function() {
        var x = 0;
        var y = 0;
        var w = this.width() / 10;
        var h = this.height();

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].extent(x, y, w, h).draw();
            x += w;
        }
    }
});
