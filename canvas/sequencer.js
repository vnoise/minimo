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

    drawCanvas: function(context) {
        var s = this.stepx = this.width() / 16;
        var w = this.stepx * 0.8;
        var h = this.height();
        var x = 0;

        var pattern = this._pattern[this._clip];

        for (var i = 0; i < 16; i++) {          
            context.fillStyle = pattern[i] == 1 ? "#f00" : "#009";
            context.fillRect(x, 0, w, h);
            
            if (this._clock == i) {
                context.fillStyle = "#0f0";
                context.fillRect(x, 0, w, 10);
            }
            
            x += s;
        }
    },

    indexForEvent: function(event) {
        return Math.floor(event.localX / this.stepx);
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
    },

    clip: function(clip) {
        this._clip = clip;
    },

    clock: function(clock) {
        this._clock = clock % 16;
    }
});

