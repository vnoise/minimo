function Slider(instrument, key, min, max, step) {
    this.instrument = instrument;
    this.key = key;
    this.min = min;
    this.max = max;
    this.step = step;
    this.active = false;
}

Slider.prototype.render = function(container) {
    this.container = $('<div class="slider"/>');
    $(container).append(this.container);

    this.container.svg({ onLoad: this.draw.bind(this) });
};

Slider.prototype.draw = function(svg) {
    this.svg = svg;

    svg.rect(0, 0, this.container.width(), this.container.height(), { opacity: 0 });

    this.text = svg.text(5, this.container.height() / 2, this.key, { 'class': 'label' });
    this.handle = svg.rect(0, 0, 40, this.container.height(), 10, 10, { 'class': 'handle' });

    this.tracker = new TouchTracker(this, this.svg.root(), this.handleEvent.bind(this));
};

Slider.prototype.show = function() {
    if (this.active && this.instrument.showSliders) {
        this.container.slideDown();        
    }
};

Slider.prototype.hide = function() {
    this.container.slideUp();        
};

Slider.prototype.width = function(event) {
    return this.container.width() - 40;
};

Slider.prototype.setValue = function(value) {
    value = Math.max(this.min, Math.min(this.max, value));
    this.value = value;
    this.position = this.width() * ((value - this.min) / (this.max - this.min));
    this.handle.setAttribute('x', this.position);
};

Slider.prototype.handleEvent = function(event) {
    var sliderLeft = $(this.svg.root()).offset().left;
    var left = event.pageX - sliderLeft - 10;
    var value = this.min + (left / this.width()) * (this.max - this.min);

    value = Math.floor(value / this.step) * this.step;

    if (value != this.value) {
        this.setValue(value);

        controller.send('parameter', this.instrument.index, this.key, this.value);
    }
};
