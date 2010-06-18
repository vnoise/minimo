
function Automation(instrument, container, key) {
    this.instrument = instrument;    
    this.container = $('<div class="automation"/>');
    this.key = key;

    container.append(this.container);

    this.width = this.container.width();
    this.height = this.container.height();
    this.canvas = Raphael(this.container.get(0), this.width, this.height);
    this.pattern = [];
    this.clockPattern = [];
    this.stepPattern = [];
    this.clip = 0;

    this.container.hide();
    this.hidden = true;
    this.tracker = new TouchTracker(this, this.canvas.canvas, this.handleEvent.bind(this));

    for (var i = 0; i < 8; i++) {
        this.pattern[i] = [];
        for (var j = 0; j < 16; j++) {
            this.pattern[i][j] = 0;
        }
    }

    this.draw();
}

Automation.prototype.handleEvent = function(event) {
    var index;

    for (var i = 0; i < 16; i++) {
        if (this.clockPattern[i][0] == event.target) {
            index = i;
        }
    }

    var y = event.pageY - this.container.offset().top;

    this.setStep(this.clip, index, 1 - y / this.height); 
    this.send(index);
};

Automation.prototype.toggle = function() {
    if (this.hidden) {
        this.hidden = false;
        this.container.slideDown();
    }
    else {
        this.hidden = true;
        this.container.slideUp();
    }
};

Automation.prototype.draw = function() {
    for (var x = 0, i = 0; x < this.width; x += 20, i += 1) {
        this.stepPattern[i] = this.canvas.rect(x, 200, 20, 200).attr({
            fill: "#faa",
            stroke: "none",
            opacity: 1
        });

        this.clockPattern[i] = this.canvas.rect(x, 0, 20, this.height).
            attr({ fill: '#999', opacity: i % 4 == 0 ? 0.5 : 0.2 });
    }
};

Automation.prototype.send = function(index) {
    controller.send('automation', this.instrument.index, this.clip, this.key, index, this.pattern[this.clip][index]);
};

Automation.prototype.setStep = function(clip, index, value) {
    if (Math.abs(this.pattern[clip][index] - value) >= 0.02) {
        this.pattern[clip][index] = value;
        this.stepPattern[index].attr('y', this.height - value * this.height);        
    }
};

Automation.prototype.clock = function(index) {
    if (!this.hidden) {
        this.clockPattern[index].
            attr({ opacity: 1 }).
            animate({ opacity: index % 4 == 0 ? 0.5 : 0.2 }, 400);        
    }
};

Automation.prototype.setClip = function(clip) {
    this.clip = clip;

    for (var i = 0; i < 16; i++) {
        this.stepPattern[i].attr('y', this.height - this.pattern[this.clip][i] * this.height);        
    }
};

