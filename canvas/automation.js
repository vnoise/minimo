var Automation = new Class({
    Extends: Widget,

    initialize: function (options) {
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
        var w = this.width();
        var h = this.height();

        this.stepx = w / 16;

        for (var i = 0; i < 16; i++) {
            var value = this.pattern[i];
            var x = i * this.stepx;

            context.fillStyle = "#00f";        
            context.fillRect(x, 0, this.stepx, h);
            context.fillStyle = "#f00";
            context.fillRect(x, h - value * h, this.stepx, value * h);

            if (this._clock == i) {
                context.fillStyle = "#0f0";
                context.fillRect(i * this.stepx, 0, 2, h);
            }
        }

        context.font = "20px Helvetica";
        context.fillStyle = "#f00";
        context.fillText(this.key, 5, h / 2);
    },

    handleEvent: function(event) {
        var index = Math.floor(event.localX / this.stepx);
        var value = Math.max(0, Math.min(1, 1 - event.localY / this.height()));
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
