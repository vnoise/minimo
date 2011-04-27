function Automation(options) {
    Widget.call(this, options);

    this.pattern = [];
    this.clocks = [];
    this.steps = [];
    this.clip = 0;

    for (var i = 0; i < 16; i++) {
        this.pattern[i] = 0;
    }
}

Automation.prototype = {
    __proto__: Widget.prototype,

    draw: function() {
        var w = this.width();
        var h = this.height();

        this.attr('class', 'automation');

        this.rect(0, 0, w, h, 0, 0);

        this.stepx = w / 16;

        this.text = this.text(5, h / 2, this.key, { 'class': 'label' });

        for (var i = 0; i < 16; i++) {
            this.steps[i] = this.rect(i * this.stepx, 0, this.stepx, 0, { 'class': 'step' });

            this.clocks[i] = this.rect(i * this.stepx, 0, this.stepx, h, {
                'class': 'clock',
                opacity: i % 4 == 0 ? 0.2 : 0
            });
        }

        this.drawSteps();
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

        return true;
    },

    onTouchDown: function(event) {
        this.handleEvent(event);
    },

    onTouchMove: function(event) {
        this.handleEvent(event);
    },

    send: function(index) {
        this.instrument.send('/automation', 'sif', this.key, index, this.pattern[index]);
    },

    setStep: function(index, value) {
        this.pattern[index] = value;
        this.drawStep(index, value);
    },

    drawStep: function(index, value) {
        var rect = this.steps[index];
        var h = this.height();

        if (rect) {
            rect.setAttribute('height', value * h);
            rect.setAttribute('y', h - value * h);        
        }
    },

    drawSteps: function() {
        for (var i = 0; i < 16; i++) {
            this.drawStep(i, this.pattern[i]);
        }
    },

    clock: function(index) {
        for (var i = 0; i < 16; i++) {
            this.clocks[i].setAttribute('opacity', i % 4 == 0 ? 0.1 : 0);
        }

        this.clocks[(index + 13) % 16].setAttribute('opacity', 0.2);
        this.clocks[(index + 14) % 16].setAttribute('opacity', 0.3);
        this.clocks[(index + 15) % 16].setAttribute('opacity', 0.4);
        this.clocks[(index + 16) % 16].setAttribute('opacity', 0.5);

        // this.svg.animate.start(this.clocks[index], { opacity: index % 4 == 0 ? 0.2 : 0 }, 500);    
    }
};

