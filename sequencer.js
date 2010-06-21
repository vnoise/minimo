function Sequencer(instrument) {
    this.instrument = instrument;
    this.container = $('<div class="sequencer"></div>');
    this.instrument.container.append(this.container);
    this.canvas = Raphael(this.container.get(0), 320, 200);
    this.pattern = [];
    this.clockPattern = [];
    this.stepPattern = [];
    this.clip = 0;

    for (var i = 0; i < 8; i++) {
        this.pattern[i] = [];
        for (var j = 0; j < 16; j++) {
            this.pattern[i][j] = 0;
        }
    }

    this.tracker = new TouchTracker(this, this.canvas.canvas, this.handleEvent.bind(this));

    this.draw();
}

Sequencer.prototype.draw = function() {
    for (var y = 40, i = 0; y < 200; y += 40) {
        for (var x = 40; x < 320; x += 80, i += 1) {
            this.stepPattern[i] = this.canvas.circle(x, y, 16).attr({
                fill: "#faa",
                stroke: "none",
                opacity: 0
            });

            this.clockPattern[i] = this.canvas.circle(x, y, 1).attr({
                fill: "#afa",
                stroke: "none"
            });
        }
    }
};

Sequencer.prototype.handleEvent = function(event, first) {
    var x = event.pageX - this.container.offset().left;
    var y = event.pageY - this.container.offset().top;
    var index = Math.floor(y / 50) * 4 + Math.floor(x / 80);

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
        if (value == 0) {
            this.stepPattern[index].scale(1).animate({ scale: 0, opacity: 0 }, 500);        
        }
        else {
            this.stepPattern[index].scale(2).animate({ scale: 1, opacity: 1 }, 500);        
        }
    }
};

Sequencer.prototype.clock = function(index) {
    this.clockPattern[index].scale(10).animate({ scale: 1 }, 300);
};

Sequencer.prototype.setClip = function(clip) {
    this.clip = clip;

    for (var i = 0; i < 16; i++) {
        this.stepPattern[i].attr('opacity', this.pattern[this.clip][i]);
    }
};
