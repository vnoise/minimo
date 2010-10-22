function Automation(svg, instrument, options) {
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
}

Automation.prototype.set = function(options) {
    for (var name in options) {
        this[name] = options[name];
    }
};

Automation.prototype.clear = function(svg) {
    $(this.text).remove();

    for (var i = 0; i < this.steps.length; i++) {
        $(this.steps[i]).remove();
        $(this.clocks[i]).remove();
    }
};

Automation.prototype.setSize = function(width, height) {
    this.container.css({
        width: width,
        height: height
    });

    this.draw();
};

Automation.prototype.draw = function() {
    this.svg.rect(this.x, this.y, this.width, this.height, 0, 0, { 'class': 'automation' });
    this.clear();   

    this.stepx = this.width / 16;

    this.text = this.svg.text(this.x + 5, this.y + this.height / 2, this.key, { 'class': 'automation-label' });

    for (var i = 0; i < 16; i++) {
        this.steps[i] = this.svg.rect(this.x + i * this.stepx, this.y, this.stepx, 0, {
            'class': 'automation-step'
        });

        this.clocks[i] = this.svg.rect(this.x + i * this.stepx, this.y, this.stepx, this.height, {
            opacity: i % 4 == 0 ? 0.2 : 0
        });
    }

    this.drawSteps();

    TouchTracker.add(this);
};

Automation.prototype.handleEvent = function(event) {
    var index = Math.floor(event.localX / this.stepx);
    var value = Math.max(0, Math.min(1, 1 - event.localY / this.height));
    var step = this.step / (this.max - this.min);

    value = Math.floor(value / step) * step;

    if (this.pattern[this.clip][index] != value) {
        this.setStep(this.clip, index, value); 
        this.send(index);
    }

    return true;
};

Automation.prototype.send = function(index) {
    controller.send('automation', this.instrument.index, this.clip, this.key, index, this.pattern[this.clip][index]);
};

Automation.prototype.setStep = function(clip, index, value) {
    this.pattern[clip][index] = value;
    this.drawStep(index, value);
};

Automation.prototype.drawStep = function(index, value) {
    var rect = this.steps[index];

    if (rect) {
        rect.setAttribute('height', value * this.height);
        rect.setAttribute('y', this.y + this.height - value * this.height);        
    }
};

Automation.prototype.drawSteps = function(clip) {
    for (var i = 0; i < 16; i++) {
        this.drawStep(i, this.pattern[this.clip][i]);
    }
};

Automation.prototype.clock = function(index) {
    // this.clocks[index].setAttribute('opacity', 0.5);
    // this.svg.animate.start(this.clocks[index], { opacity: index % 4 == 0 ? 0.2 : 0 }, 200);    
};

Automation.prototype.setClip = function(clip) {
    this.clip = clip;
    this.drawSteps();
};

