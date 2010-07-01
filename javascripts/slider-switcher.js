function SliderSwitcher(instruments) {
    this.instruments = instruments;
    this.links = [];
    this.keys = {};
};

SliderSwitcher.prototype.render = function(container) {
    this.container = $('<div class="slider-switcher"></div>');

    $(container).append(this.container);
};

SliderSwitcher.prototype.addSlider = function(key) {
    if (this.keys[key]) {
        return;
    }

    this.keys[key] = true;

    var link = $('<a href="#">' + key + '</a>');

    this.container.append(link);
    link.click(this.onClick.bind(this, key, link));
};


SliderSwitcher.prototype.onClick = function(key, link, event) {
    link.toggleClass('active');

    for (var i in this.instruments) {
        if (link.hasClass('active')) {
            this.instruments[i].activate(key);
        }
        else {
            this.instruments[i].deactivate(key);
        }
    }


    return false;
};
