var Sequencer = new Class({
    Extends: Widget,

    initialize: function(options) {
        Widget.prototype.initialize.call(this, options);

        this._pattern = [];
        this._clocks = [];
        this._steps = [];
        this._clip = 0;

        for (var i = 0; i < 8; i++) {
            this._pattern[i] = [];
            for (var j = 0; j < 16; j++) {
                this._pattern[i][j] = 0;
            }
        }
    },

    draw: function() {
        this.attr('class', 'sequencer');
        this.rect(0, 0, this.width(), this.height(), { rx: 10, ry: 10 });

        this.stepx = this.width() / 4;
        this.stepy = this.height() / 4;
        this.radius = (this.stepx + this.stepy) / 12;

        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var x = this.stepx / 2 + j * this.stepx;
                var y = this.stepy / 2 + i * this.stepy;
                this._steps[i * 4 + j] = this.circle(x, y, this.radius, { 'class': 'step', opacity: 0 });
                this._clocks[i * 4 + j] = this.circle(x, y, 1, { 'class': 'clock' });
            }
        }

        this.drawSteps();
    },

    indexForEvent: function(event) {
        return Math.floor(event.localY / this.stepy) * 4 + Math.floor(event.localX / this.stepx);
    },

    touchStep: function(index) {
        if (this.draggingValue != this._pattern[this._clip][index]) {
            this.setStep(this._clip, index, this.draggingValue); 

            this.instrument.send('/pattern', 'iif', this._clip, index, this._pattern[this._clip][index]);        
        }
    },

    onTouchDown: function(event) {
        var index = this.indexForEvent(event);
        this.draggingValue = (this._pattern[this._clip][index] + 1) % 2;
        this.touchStep(index);
        return true;
    },

    onTouchMove: function(event) {
        this.touchStep(this.indexForEvent(event));
        return true;
    },

    setStep: function(clip, index, value) {
        this._pattern[clip][index] = value;

        if (clip == this._clip) {
            this.drawStep(index, value);
        }
    },

    drawStep: function(index, value) {
        if (this._steps[index]) {
            this._steps[index].setAttribute('opacity', value);
        }
    },

    clock: function(index) {
        var r = this.radius / 8;

        this._clocks[(index + 13) % 16].setAttribute('r', r * 1);
        this._clocks[(index + 14) % 16].setAttribute('r', r * 2);
        this._clocks[(index + 15) % 16].setAttribute('r', r * 3);
        this._clocks[(index + 16) % 16].setAttribute('r', r * 4);
    },

    drawSteps: function() {
        for (var i = 0; i < 16; i++) {
            this.drawStep(i, this._pattern[this._clip][i]);
        }
    },

    clip: function(clip) {
        this._clip = clip;
        this.drawSteps();
    }
});
