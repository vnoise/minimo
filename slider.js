
function Slider(instrument, container, key, min, max, step) {
    this.key = key;
    this.min = min;
    this.max = max;
    this.step = step;
    this.instrument = instrument;
    this.container = $('<div class="slider"/>');
    this.label = $('<div class="label"/>');
    this.range = $('<div class="range"/>');
    this.handle = $('<div class="handle"/>');
    this.position = 0;

    this.label.html(this.key);
    this.container.append(this.label).append(this.range);
    this.range.append(this.handle);
    container.append(this.container);

    this.width = this.range.width() - this.handle.width();

    this.automation = new Automation(this.instrument, container, key);

    this.label.click(this.onClickLabel.bind(this));

    this.tracker = new TouchTracker(this, this.range.get(0), this.handleEvent.bind(this));
}

Slider.prototype.onClickLabel = function(event) {
    this.automation.toggle();
    event.preventDefault();
};

Slider.prototype.setValue = function(value) {
    value = Math.max(this.min, Math.min(this.max, value));
    this.value = value;
    this.position = this.width * ((value - this.min) / (this.max - this.min));
    this.handle.css('marginLeft', this.position + 'px');     
};

Slider.prototype.handleEvent = function(event) {
    var sliderLeft = this.range.offset().left;
    var left = event.pageX - sliderLeft - this.handle.width() / 2;
    var value = this.min + (left / this.width) * (this.max - this.min);

    value = Math.floor(value / this.step) * this.step;

    if (value != this.value) {
        this.setValue(value);

        controller.send('parameter', this.instrument.index, this.key, this.value);
    }
};
