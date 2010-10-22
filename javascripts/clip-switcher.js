function ClipSwitcher(svg, instrument, options) {
    this.svg = svg;
    this.instrument = instrument;
    this.active = 0;
    this.clips = [];
    this.set(options);
}

ClipSwitcher.prototype.set = function(options) {
    for (var name in options) {
        this[name] = options[name];
    }
};

ClipSwitcher.prototype.draw = function() {
    this.stepx = this.width / 8;

    for (var i = 0; i < 8; i++) {
        this.clips[i] = this.svg.rect(this.x + i * this.stepx, this.y, this.stepx, this.height, 0, 0, {
            'class': 'clipswitcher-button',
            opacity: 0.3
        });

        this.svg.text(this.x + i * this.stepx + this.stepx / 2 - 3, this.y + this.height / 2 + 5, i.toString(), { 'class': 'clipswitcher-label' })   
    }

    this.drawActive();

    TouchTracker.add(this);
};


ClipSwitcher.prototype.handleEvent = function(event) {
    this.setClip(Math.floor(event.localX / this.stepx));
    this.instrument.setClip(this.active);
    
    controller.send('clip', this.instrument.index, this.active);
};

ClipSwitcher.prototype.drawActive = function() {
    if (this.clips[this.active]) {
        this.svg.animate.start(this.clips[this.active], { opacity: 1 }, 100);
    }
}

ClipSwitcher.prototype.setClip = function(clip) {
    if (this.active != clip) {
        if (this.clips[this.active]) {
            this.svg.animate.start(this.clips[this.active], { opacity: 0.3 }, 100);
        }
        this.active = clip;
        this.drawActive();
    }
};
