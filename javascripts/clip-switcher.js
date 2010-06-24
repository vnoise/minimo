function ClipSwitcher(instrument) {
    this.instrument = instrument;    
}

ClipSwitcher.prototype.render = function(container) {
    this.container = $('<table class="clips"></table>');

    var tr = $('<tr/>');
    this.container.append(tr);

    for (var i = 0; i < 4; i++) {
        var td = $('<td/>');
        var link = $('<a href="#">' + i + '</a>');
        td.append(link);
        tr.append(td);
        link.click(this.onClickClip.bind(this, i, link));
    }

    $(container).append(this.container);
};


ClipSwitcher.prototype.onClickClip = function(index, link, event) {
    this.instrument.setClip(index);

    controller.send('clip', this.instrument.index, index);

    return false;
};

ClipSwitcher.prototype.setClip = function(clip) {
    this.container.find('a').removeClass('active');
    $(this.container.find('a').get(clip)).addClass('active');
};
