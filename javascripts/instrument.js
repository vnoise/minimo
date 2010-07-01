function Instrument(index) {
    this.index = index;
    this.clips = new ClipSwitcher(this);
    this.sequencer = new Sequencer(this);
    this.sliders = {};
    this.automations = {};
    this.showSliders = false;
    this.showAutomations = false;

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

Instrument.prototype.onSelectMode = function() {
    controller.send('mode', this.index, this.modeSelect.val());
};

Instrument.prototype.render = function(container) {
    this.container = $('<div class="instrument"/>');
    this.modeSelect =  $('<select class="mode-select"/>');

    $(container).append(this.container);

    for (var i in this.modes) {
        var option = $('<option/>');
        option.html(this.modes[i]);
        this.modeSelect.append(option);
    }

    this.modeSelect.change(this.onSelectMode.bind(this));

    this.clips.render(this.container);
    this.sequencer.render(this.container);
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

    slider.hide();
    automation.hide();
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
