function Automation(instrument, key, min, max, step) {
    this.instrument = instrument;    
    this.key = key;

    this.pattern = [];
    this.clocks = [];
    this.steps = [];
    this.clip = 0;
    this.step = step / (max - min);

    this.visible = true;
    this.active = false;

    for (var i = 0; i < 8; i++) {
        this.pattern[i] = [];
        for (var j = 0; j < 16; j++) {
            this.pattern[i][j] = 0;
        }
    }
}

Automation.prototype.render = function(container) {
    this.container = $('<div class="automation"/>');

    $(container).append(this.container);

    this.width = this.container.width();
    this.height = this.container.height();

    this.container.svg({ onLoad: this.draw.bind(this) });
};

Automation.prototype.draw = function(svg) {
    this.svg = svg;
    this.stepx = this.container.width() / 16;

    this.text = svg.text(5, this.container.height() / 2, this.key, { 'class': 'label' });

    for (var i = 0; i < 16; i++) {
        this.steps[i] = svg.rect(i * this.stepx, 0, this.stepx, 0, {
            fill: "#faa",
            stroke: "none",
            opacity: 1
        });

        this.clocks[i] = svg.rect(i * this.stepx, 0, this.stepx, this.height, {
            fill: '#999', 
            opacity: i % 4 == 0 ? 0.2 : 0
        });
    }

    this.tracker = new TouchTracker(this, this.svg.root(), this.handleEvent.bind(this));
};

Automation.prototype.handleEvent = function(event) {
    var x = event.pageX - this.container.offset().left;
    var y = event.pageY - this.container.offset().top;
    var index = Math.floor(x / this.stepx);
    var value = Math.max(0, Math.min(1, 1 - y / this.height));

    value = Math.floor(value / this.step) * this.step;

    if (this.pattern[this.clip][index] != value) {

        this.setStep(this.clip, index, value); 
        this.send(index);
    }
};

Automation.prototype.show = function() {
    this.visible = true;

    if (this.active && this.instrument.showAutomations) {
        this.container.slideDown();        
    }
};

Automation.prototype.hide = function() {
    this.visible = false;

    this.container.slideUp();
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

    rect.setAttribute('height', value * this.height);
    rect.setAttribute('y', this.height - value * this.height);
};

Automation.prototype.clock = function(index) {
    if (this.visible) {
        this.clocks[index].setAttribute('opacity', 0.5);

        this.svg.animate.start(this.clocks[index], { opacity: index % 4 == 0 ? 0.2 : 0 }, 200);        
    }
};

Automation.prototype.setClip = function(clip) {
    this.clip = clip;

    for (var i = 0; i < 16; i++) {
        this.drawStep(i, this.pattern[this.clip][i]);
    }
};

