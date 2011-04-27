Sequencer = function(options) {
    Widget.call(this, options);

    this.pattern = [];
    this.clocks = [];
    this.steps = [];
    this.clip = 0;

    for (var i = 0; i < 8; i++) {
        this.pattern[i] = [];
        for (var j = 0; j < 16; j++) {
            this.pattern[i][j] = 0;
        }
    }
};

Sequencer.prototype = {
    __proto__: Widget.prototype,

    draw: function() {
        this.attr('class', 'sequencer');
        this.rect(0, 0, this.width(), this.height(), 10, 10);

        this.stepx = this.width() / 4;
        this.stepy = this.height() / 4;
        this.radius = (this.stepx + this.stepy) / 12;

        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                var x = this.stepx / 2 + j * this.stepx;
                var y = this.stepy / 2 + i * this.stepy;
                this.steps[i * 4 + j] = this.circle(x, y, this.radius, { 'class': 'step', opacity: 0 });
                this.clocks[i * 4 + j] = this.circle(x, y, 1, { 'class': 'clock' });
            }
        }

        this.drawSteps();
    },

    indexForEvent: function(event) {
        return Math.floor(event.localY / this.stepy) * 4 + Math.floor(event.localX / this.stepx);
    },

    touchStep: function(index) {
        if (this.draggingValue != this.pattern[this.clip][index]) {
            this.setStep(this.clip, index, this.draggingValue); 

            this.instrument.send('/pattern', 'iif', this.clip, index, this.pattern[this.clip][index]);        
        }
    },

    onTouchDown: function(event) {
        var index = this.indexForEvent(event);
        this.draggingValue = (this.pattern[this.clip][index] + 1) % 2;
        this.touchStep(index);
    },

    onTouchMove: function(event) {
        this.touchStep(this.indexForEvent(event));
    },

    setStep: function(clip, index, value) {
        this.pattern[clip][index] = value;

        if (clip == this.clip) {
            this.drawStep(index, value);
        }
    },

    drawStep: function(index, value) {
        if (this.steps[index]) {
            this.steps[index].setAttribute('opacity', value);
        }
    },

    clock: function(index) {   
        for (var i = 0; i < 16; i++) {
            this.clocks[i].setAttribute('r', 1);
        }

        this.clocks[(index + 13) % 16].setAttribute('r', 2);
        this.clocks[(index + 14) % 16].setAttribute('r', 4);
        this.clocks[(index + 15) % 16].setAttribute('r', 6);
        this.clocks[(index + 16) % 16].setAttribute('r', 8);

        // this.svg.animate.start(this.clocks[index], { r: 1 }, 500);
    },

    drawSteps: function() {
        for (var i = 0; i < 16; i++) {
            this.drawStep(i, this.pattern[this.clip][i]);
        }
    },

    setClip: function(clip) {
        this.clip = clip;
        this.drawSteps();
    }
};
