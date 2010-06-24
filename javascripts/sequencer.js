function Sequencer(instrument) {
    this.instrument = instrument;
    this.container = $('<div class="sequencer"/>');
    this.stepx = 40;
    this.stepy = 40;

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
}

Sequencer.prototype.render = function(container) {
    $(container).append(this.container);
    this.container.svg({ onLoad: this.draw.bind(this) });
};

Sequencer.prototype.draw = function(svg) {
    this.svg = svg;

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var x = this.stepx / 2 + j * this.stepx;
            var y = this.stepy / 2 + i * this.stepy;
            this.steps[i * 4 + j] = svg.circle(x, y, 13, {
                fill: "#faa",
                stroke: "none",
                opacity: 0
            });

            this.clocks[i * 4 + j] = svg.circle(x, y, 1, {
                fill: "#afa",
                stroke: "none"
            });
        }
    }

    this.tracker = new TouchTracker(this, svg.root(), this.handleEvent.bind(this));
};

Sequencer.prototype.handleEvent = function(event, first) {
    var offset = $(this.svg.root()).offset();
    var x = event.pageX - offset.left;
    var y = event.pageY - offset.top;
    var index = Math.floor(y / this.stepy) * 4 + Math.floor(x / this.stepx);

    if (first) {
        this.draggingValue = (this.pattern[this.clip][index] + 1) % 2;
    }

    if (this.draggingValue != this.pattern[this.clip][index]) {
        this.setStep(this.clip, index, this.draggingValue); 

        controller.send('pattern', this.instrument.index, this.clip, index, this.pattern[this.clip][index]);        
    }
};


Sequencer.prototype.setStep = function(clip, index, value) {
    this.pattern[clip][index] = value;

    if (clip == this.clip) {
        this.drawStep(index, value);
    }
};

Sequencer.prototype.drawStep = function(index, value) {
    this.svg.animate.start(this.steps[index], { opacity: value * 0.8 }, 500);
};

Sequencer.prototype.clock = function(index) {
    this.clocks[index].setAttribute('r', 8);
    this.svg.animate.start(this.clocks[index], { r: 1 }, 500);
};

Sequencer.prototype.setClip = function(clip) {
    this.clip = clip;

    for (var i = 0; i < 16; i++) {
        this.drawStep(i, this.pattern[clip][i]);
    }
};
