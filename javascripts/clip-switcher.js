function ClipSwitcher(options) {
    Widget.call(this, options);

    this.active = 0;

    for (var i = 0; i < 8; i++) {
        this.add({
            type: ClipButton,
            label: i.toString(),
            clip: i,
            callback: this.callback.bind(this)
        });     
    }
}

$.extend(ClipSwitcher.prototype, {
    __proto__: Widget.prototype,

    draw: function() {
        this.attr('class', 'clipswitcher');
        this.stepx = this.width() / 8;

        for (var i = 0; i < 8; i++) {           
            this.children[i].extent(i * this.stepx, 0, this.stepx, this.height()).draw();
        }

        this.drawActive();
    },

    callback: function(clip) {
        this.setClip(clip);
        this.instrument.setClip(this.active);
    
        this.instrument.send('/clip', 'i', this.active);
    },

    drawActive: function() {
        for (var i = 0; i < 8; i++) {
            this.children[i].opacity(i == this.active ? 1 : 0.6);
        }
    },

    setClip: function(clip) {
        this.active = clip;
        this.drawActive();
    }
});


function ClipButton(options) {
    Widget.call(this, options);
}

$.extend(ClipButton.prototype, {
    __proto__: Widget.prototype,

    draw: function() {
        this.attr('class', 'button');

        this.rect(0, 0, this.width(), this.height(), 0, 0);
        this.text(5, this.height() / 2 + 4, this.label, { 'class': 'label' });
    },

    onTouchDown: function(event) {
        this.callback(this.clip);
    }
});
