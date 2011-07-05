var Automation = new Class({
    Extends: Widget,

    initialize: function (options) {
        this.clockColor = '#fff';

        Widget.prototype.initialize.call(this, options);

        this.pattern = [];
        this.clocks = [];
        this.steps = [];
        this.clip = 0;

        for (var i = 0; i < 16; i++) {
            this.pattern[i] = 0;
        }
    },

    drawCanvas: function(context) {
        var w = this.width;
        var h = this.height;

        this.stepx = w / 16;

        for (var i = 0; i < 16; i++) {
            var value = this.pattern[i];
            var x = i * this.stepx;

            context.fillStyle = this.bgColor;        
            context.fillRect(x, 0, this.stepx, h);
            context.fillStyle = this.fgColor;
            context.fillRect(x, h - value * h, this.stepx, value * h);

            if (this._clock == i) {
                context.fillStyle = this.clockColor;
                context.fillRect(i * this.stepx, h - 5, 1, 5);
            }
        }

        context.font = (this.height / 5) + "px Arial";
        context.fillStyle = "#fff";
        context.fillText(this.key, 5, 20);
    },

    handleEvent: function(event) {
        var index = Math.floor(event.localX / this.stepx);
        var value = Math.max(0, Math.min(1, 1 - event.localY / this.height));
        var step = this.step / (this.max - this.min);

        value = Math.floor(value / step) * step;

        if (this.pattern[index] != value) {
            this.setStep(index, value); 
            this.send(index);
        }
    },

    onTouchDown: function(event) {
        this.handleEvent(event);
        return true;
    },

    onTouchMove: function(event) {
        this.handleEvent(event);
        return true;
    },

    send: function(index) {
        this.instrument.send('/automation', 'sif', this.key, index, this.pattern[index]);
    },

    setStep: function(index, value) {
        this.pattern[index] = value;
    },

    clock: function(clock) {
        this._clock = clock % 16;
    }
});
