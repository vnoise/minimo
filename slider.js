
function Slider(instrument, container, key, max) {
    this.max = max;
    this.instrument = instrument;
    this.key = key;
    this.container = $('<div class="slider"/>');
    this.label = $('<div class="label"/>');
    this.range = $('<div class="range"/>');
    this.handle = $('<div class="handle"/>');
    this.left = 0;

    this.label.html(this.key);
    this.container.append(this.label).append(this.range);
    this.range.append(this.handle);
    container.append(this.container);

    this.automation = new Automation(this.instrument, container, key);

    this.label.click(this.onClickLabel.bind(this));

    this.tracker = new TouchTracker(this, this.range.get(0), this.handleEvent.bind(this));
}

Slider.prototype.onClickLabel = function(event) {
    this.automation.toggle();
    event.preventDefault();
};

Slider.prototype.setValue = function(value) {
    if (value >= 0 && value <= this.max) {
        this.value = value;
        this.left = this.range.width() * (value / this.max);
        this.handle.css('marginLeft', this.left + 'px');            
    }
};

Slider.prototype.handleEvent = function(event) {
    var sliderWidth = this.range.width();
    var sliderLeft = this.range.offset().left;
    var sliderRight = sliderLeft + sliderWidth;
    var left = event.pageX - sliderLeft - this.handle.width() / 2;
    var value = (left / sliderWidth) * this.max;

    if (Math.abs(this.left - left) >= 5) {
        this.setValue(value);

        controller.send('parameter', this.instrument.index, this.key, this.value);
    }
};
