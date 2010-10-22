function Sequencer(svg, instrument, options) {
    this.svg = svg;
    this.instrument = instrument;

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

    this.set(options);
};

Sequencer.prototype.set = function(options) {
    for (var name in options) {
        this[name] = options[name];
    }
};

Sequencer.prototype.draw = function() {
    this.svg.rect(this.x, this.y, this.width, this.height, 10, 10, { 'class': 'sequencer' });

    this.stepx = this.width / 4;
    this.stepy = this.height / 4;
    this.radius = (this.stepx + this.stepy) / 12;

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var x = this.x + this.stepx / 2 + j * this.stepx;
            var y = this.y + this.stepy / 2 + i * this.stepy;
            this.steps[i * 4 + j] = this.svg.circle(x, y, this.radius, { 'class': 'sequencer-step', opacity: 0 });
            this.clocks[i * 4 + j] = this.svg.circle(x, y, 1, { 'class': 'sequencer-clock' });
        }
    }

    this.drawSteps();

    TouchTracker.add(this);
};

Sequencer.prototype.handleEvent = function(event, first) {
    var index = Math.floor(event.localY / this.stepy) * 4 + Math.floor(event.localX / this.stepx);
    if (first) {
        this.draggingValue = (this.pattern[this.clip][index] + 1) % 2;
    }

    if (this.draggingValue != this.pattern[this.clip][index]) {
        this.setStep(this.clip, index, this.draggingValue); 

        controller.send('pattern', this.instrument.index, this.clip, index, this.pattern[this.clip][index]);        
    }

    return true;
};


Sequencer.prototype.setStep = function(clip, index, value) {
    this.pattern[clip][index] = value;

    if (clip == this.clip) {
        this.drawStep(index, value);
    }
};

Sequencer.prototype.drawStep = function(index, value) {
    if (this.steps[index]) {
        this.steps[index].setAttribute('opacity', value);
    }
};

Sequencer.prototype.clock = function(index) {
    // this.clocks[index].setAttribute('r', 8);
    // this.svg.animate.start(this.clocks[index], { r: 1 }, 50);
};


Sequencer.prototype.drawSteps = function() {
    for (var i = 0; i < 16; i++) {
        this.drawStep(i, this.pattern[this.clip][i]);
    }
};

Sequencer.prototype.setClip = function(clip) {
    this.clip = clip;
    this.drawSteps();
};
