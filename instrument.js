function Instrument(index, container) {
    this.index = index;
    this.container = $('<div class="instrument"/>');
    this.clips = $('<div class="clips"></div>');
    this.container.append(this.clips);

    container.append(this.container);

    for (var i = 0; i < 8; i++) {
        var link = $('<a href="#">' + i + '</a>');
        this.clips.append(link);
        link.click(this.onClickClip.bind(this, i, link));
    }

    this.sequencer = new Sequencer(this, this.container);

    this.sliders = {};
}

Instrument.prototype.slider = function(key, max) {
    this.sliders[key] = new Slider(this, this.container, key, max);
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

    for (var key in this.sliders) {
        this.sliders[key].automation.clock(index);
    }
};

Instrument.prototype.setClip = function(clip) {
    this.clips.removeClass('active');
    $(this.clips.get(clip)).addClass('active');

    this.sequencer.setClip(clip);

    for (var key in this.sliders) {
        this.sliders[key].automation.setClip(clip);
    }
};
