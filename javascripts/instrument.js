function Instrument(svg, index, options) {
    this.svg = svg;
    this.index = index;

    this.clipswitcher = new ClipSwitcher(this.svg, this);
    this.sequencer = new Sequencer(this.svg, this, {});
    this.sliders = [];
    this.automations = [];

    this.types = [
        "sinus",
        "saw",
        "square",
        "noise",
        "sample"
    ];

    this.modes = [
        "chromatic",
        "lydian",
        "ionian",
        "mixolydian",
        "dorian",
        "aeolian",
        "phrygian",
        "locrian"
        // "harmonic minor",
        // "melodic minor",        
        // "major pentatonic",
        // "minor pentatonic",        
        // "wholetone",
        // "whole-half",
        // "half-whole"
    ];

    this.typeMenu = new Menu(this.svg, this, {
        options: this.types,
        callback: this.onSelectType.bind(this)
    });

    this.modeMenu = new Menu(this.svg, this, {
        options: this.modes,
        callback: this.onSelectMode.bind(this)
    });

    this.sampleMenu = new Menu(this.svg, this, {
        options: window.samples,
        callback: this.onSelectSample.bind(this)
    });

    this.set(options);
};

Instrument.prototype.set = function(options) {
    for (var name in options) {
        this[name] = options[name];
    }
};

Instrument.prototype.draw = function() {
    var x = this.x;
    var y = this.y;
    var width = this.width;

    var buttonheight = 20;
    var buttonwidth = 60

    this.typeMenu.set({
        x: x,
        y: y,
        width: buttonwidth,
        height: buttonheight
    });

    this.typeMenu.draw();

    x += buttonwidth + 10;

    this.modeMenu.set({
        x: x,
        y: y,
        width: buttonwidth,
        height: buttonheight
    });

    this.modeMenu.draw();

    x += buttonwidth + 10;

    this.sampleMenu.set({
        x: x,
        y: y,
        width: buttonwidth,
        height: buttonheight
    });

    this.sampleMenu.draw();

    x = this.x;
    y += buttonheight + 10;

    this.clipswitcher.set({
        x: x,
        y: y,
        width: width, 
        height: 20
    });

    this.clipswitcher.draw();

    x = this.x;
    y += this.clipswitcher.height + 10;

    this.sequencer.set({
        x: x,
        y: y,
        width: width,
        height: 80
    });

    this.sequencer.draw();

    x = this.x;
    y += this.sequencer.height + 10;

    var slidergap = 5;
    var sliderwidth = this.width / 10;
    var sliderheight = 80;

    for (var i = 0; i < this.sliders.length; i++) {
        this.sliders[i].set({
            x: x,
            y: y,
            width: sliderwidth,
            height: sliderheight
        });

        this.sliders[i].draw();

        x += sliderwidth;
    }

    x = this.x;
    y += sliderheight + 10;

    var automationheight = 50;

    for (var i = 0; i < this.automations.length; i++, y += automationheight) {
        this.automations[i].set({
            x: x,
            y: y,
            width: this.width,
            height: automationheight
        });

        this.automations[i].draw();
    }
    
};

Instrument.prototype.getSlider = function(key) {
    for (var i = 0; i < this.sliders.length; i++) {
        if (this.sliders[i].key == key) {
            return this.sliders[i];
        }    
    }
    return null;
};

Instrument.prototype.getAutomation = function(key) {
    for (var i = 0; i < this.automations.length; i++) {
        if (this.automations[i].key == key) {
            return this.automations[i];
        }    
    }
    return null;
};

Instrument.prototype.onSelectType = function(type) {
    controller.send('type', this.index, type);
};

Instrument.prototype.onSelectSample = function(sample) {
    controller.send('sample', this.index, sample);
};

Instrument.prototype.onSelectMode = function(mode) {
    controller.send('mode', this.index, mode);
};

Instrument.prototype.setType = function(type) {
    this.typeMenu.setLabel(type);
};

Instrument.prototype.setSample = function(sample) {
    this.sampleMenu.setLabel(sample);
};

Instrument.prototype.setMode = function(mode) {
    this.modeMenu.setLabel(mode);
};

Instrument.prototype.slider = function(key, min, max, step) {
    if (this.sliders.length >= 10) {
        return;
    }

    var slider = new Slider(this.svg, this, {
        key: key, 
        min: min, 
        max: max, 
        step: step
    });

    this.sliders.push(slider);

    var automation = new Automation(this.svg, this, {
        key: key, 
        min: min, 
        max: max, 
        step: step
    });

    this.automations.push(automation);
};

Instrument.prototype.parameter = function(key, value) {
    var slider = this.getSlider(key);

    if (slider) slider.setValue(value);
};

Instrument.prototype.automation = function(key, clip, index, value) {
    var automation = this.getAutomation(key);
        
    if (automation) automation.setStep(clip, index, value);
};

Instrument.prototype.clock = function(index) {
    this.sequencer.clock(index);

    for (var i = 0; i < this.automations.length; i++) {
        this.automations[i].clock(index);
    }
};

Instrument.prototype.setClip = function(clip) {
    this.sequencer.setClip(clip);
    this.clipswitcher.setClip(clip);

    for (var i = 0; i < this.automations.length; i++) {
        this.automations[i].setClip(clip);
    }
};
