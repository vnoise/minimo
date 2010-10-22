function Slider(svg, instrument, options) {
    this.svg = svg;
    this.instrument = instrument;
    this.handleWidth = 20;
    this.set(options);
}

Slider.prototype.set = function(options) {
    for (var name in options) {
        this[name] = options[name];
    }
};

Slider.prototype.draw = function() {
    this.svg.rect(this.x, this.y, this.width, this.height,5, 5, { 'class': 'slider' });

    this.text = this.svg.text(this.x + 2, this.y + this.height / 2 + 5, this.key.slice(0, 5), { 'class': 'slider-label' });
    this.handle = this.svg.rect(this.x, this.y, this.width, this.handleWidth, 5, 5, { 'class': 'slider-handle' });

    TouchTracker.add(this);

    this.drawHandle();
};

Slider.prototype.drawHandle = function() {
    var position = 
        (this.height - this.handleWidth) * 
        ((this.value - this.min) / (this.max - this.min));

    if (this.handle) {
        this.handle.setAttribute('y', this.y + this.height - this.handleWidth - position);
    }
}

Slider.prototype.setValue = function(value) {
    this.value = Math.max(this.min, Math.min(this.max, value));
    this.drawHandle();
};

Slider.prototype.handleEvent = function(event) {    
    var value = this.min + ((this.height - event.localY) / this.height) * (this.max - this.min);

    value = Math.floor(value / this.step) * this.step;

    if (value != this.value) {
        if (Math.abs(this.value - value) > 0.05) {
            controller.send('parameter', this.instrument.index, this.key, this.value);
        }
        this.setValue(value);
    }

    return true;
};
