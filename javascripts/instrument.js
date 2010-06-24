function Instrument(index) {
    this.index = index;
    this.clips = new ClipSwitcher(this);
    this.sequencer = new Sequencer(this);
    this.sliders = {};
    this.automations = {};
}

Instrument.prototype.render = function(container) {
    this.container = $('<div class="instrument"/>');

    $(container).append(this.container);

    this.clips.render(this.container);
    this.sequencer.render(this.container);
};

Instrument.prototype.slider = function(key, min, max, step) {
    var slider = this.sliders[key] = new Slider(this, key, min, max, step);
    var automation = this.automations[key] = new Automation(this, key, min, max, step);

    slider.render(this.container);
    automation.render(this.container);
    slider.automation = automation;
    slider.hide();
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
