function Instrument(index) {
    this.index = index;
    this.clips = new ClipSwitcher(this);
    this.sequencer = new Sequencer(this);
    this.sliders = {};
    this.automations = {};
    this.showSliders = false;
    this.showAutomations = false;

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
        "locrian",       
        "harmonic minor",
        "melodic minor",        
        "major pentatonic",
        "minor pentatonic",        
        "wholetone",
        "whole-half",
        "half-whole"
    ];
}

Instrument.prototype.onSelectType = function() {
    controller.send('type', this.index, this.typeSelect.val());
};

Instrument.prototype.onSelectSample = function() {
    controller.send('sample', this.index, this.sampleSelect.val());
};

Instrument.prototype.onSelectMode = function() {
    controller.send('mode', this.index, this.modeSelect.val());
};

Instrument.prototype.setType = function(type) {
    this.typeSelect.val(type);
};

Instrument.prototype.setSample = function(sample) {
    this.sampleSelect.val(sample);
};

Instrument.prototype.setMode = function(mode) {
    this.modeSelect.val(mode);
};

Instrument.prototype.render = function(container) {
    this.container = $('<div class="instrument"/>');
    this.typeSelect =  $('<select class="type-select"/>');
    this.sampleSelect =  $('<select class="sample-select"/>');
    this.modeSelect =  $('<select class="mode-select"/>');

    $(container).append(this.container);

    var i;

    for (i in this.types) {
        this.typeSelect.append($('<option>' + this.types[i] + '</option>'));
    }

    for (i in window.samples) {
        this.sampleSelect.append($('<option>' + samples[i] + '</option>'));
    }

    for (i in this.modes) {
        this.modeSelect.append($('<option>' + this.modes[i] + '</option>'));
    }

    this.typeSelect.change(this.onSelectType.bind(this));
    this.sampleSelect.change(this.onSelectSample.bind(this));
    this.modeSelect.change(this.onSelectMode.bind(this));

    this.clips.render(this.container);
    this.sequencer.render(this.container);
    this.container.append(this.typeSelect);
    this.container.append(this.sampleSelect);
    this.container.append(this.modeSelect);
};

Instrument.prototype.activate = function(key) {
    this.sliders[key].active = true;
    this.automations[key].active = true;
    this.sliders[key].show();
    this.automations[key].show();
};

Instrument.prototype.deactivate = function(key) {
    this.sliders[key].active = false;
    this.automations[key].active = false;
    this.sliders[key].hide();
    this.automations[key].hide();
};

Instrument.prototype.showSlider = function() {
    this.showSliders = true;
    for (var key in this.sliders) {
        this.sliders[key].show();
    }
};

Instrument.prototype.hideSlider = function() {
    this.showSliders = false;
    for (var key in this.sliders) {
        this.sliders[key].hide();
    }
};

Instrument.prototype.showAutomation = function() {
    this.showAutomations = true;
    for (var key in this.automations) {
        this.automations[key].show();
    }
};

Instrument.prototype.hideAutomation = function() {
    this.showAutomations = false;
    for (var key in this.automations) {
        this.automations[key].hide();
    }
};

Instrument.prototype.slider = function(key, min, max, step) {
    var slider = this.sliders[key] = new Slider(this, key, min, max, step);
    var automation = this.automations[key] = new Automation(this, key, min, max, step);

    slider.render(this.container);
    automation.render(this.container);
};

Instrument.prototype.parameter = function(key, value) {
    this.sliders[key].setValue(value);
};

Instrument.prototype.automation = function(key, clip, index, value) {
    this.automations[key].setStep(clip, index, value);
};

Instrument.prototype.clock = function(index) {
    this.sequencer.clock(index);

    for (var key in this.automations) {
        this.automations[key].clock(index);
    }
};

Instrument.prototype.setClip = function(clip) {
    this.sequencer.setClip(clip);
    this.clips.setClip(clip);

    for (var key in this.automations) {
        this.automations[key].setClip(clip);
    }
};
