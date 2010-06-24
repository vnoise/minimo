function SliderSwitcher(instruments) {
    this.instruments = instruments;
    this.links = [];
    this.keys = {};
};

SliderSwitcher.prototype.render = function(container) {
    this.container = $('<table class="slider-switcher"></table>');

    this.tr = $('<tr/>');
    this.container.append(this.tr);

    $(container).append(this.container);
};

SliderSwitcher.prototype.addSlider = function(key) {
    if (this.keys[key]) {
        return;
    }

    this.keys[key] = true;

    if (this.links.length % 16 == 0) {
        this.tr = $('<tr/>');
        this.container.append(this.tr);
    }

    var td = $('<td/>');
    var link = $('<a href="#">' + key + '</a>');

    this.links.push(link);
    td.append(link);
    this.tr.append(td);
    link.click(this.onClick.bind(this, key, link));
};


SliderSwitcher.prototype.onClick = function(key, link, event) {
    for (var i in this.instruments) {
        this.instruments[i].sliders[key].toggle();
    }

    link.toggleClass('active');

    return false;
};
