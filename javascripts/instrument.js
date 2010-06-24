function Instrument(index) {
    this.index = index;
    this.sequencer = new Sequencer(this);
    this.sliders = {};
    this.automations = {};
}

Instrument.prototype.render = function(container) {
    this.container = $('<div class="instrument"/>');
    this.clips = $('<div class="clips"></div>');

    $(container).append(this.container);

    for (var i = 0; i < 4; i++) {
        var link = $('<a href="#">' + i + '</a>');
        this.clips.append(link);
        link.click(this.onClickClip.bind(this, i, link));
    }

    this.container.append(this.clips);
    this.sequencer.render(this.container);
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
    this.sliders[key].automation.setStep(clip, index, value);
};

Instrument.prototype.onClickClip = function(index, link, event) {
    this.setClip(index);

    controller.send('clip', this.index, index);

    return false;
};

Instrument.prototype.clock = function(index) {
    this.sequencer.clock(index);

    for (var key in this.automations) {
        this.automations[key].clock(index);
    }
};

Instrument.prototype.setClip = function(clip) {
    // this.clips.find('a').removeClass('active');
    // $(this.clips.find('a').get(clip)).addClass('active');

    this.sequencer.setClip(clip);

    for (var key in this.sliders) {
        this.automations[key].setClip(clip);
    }
};
