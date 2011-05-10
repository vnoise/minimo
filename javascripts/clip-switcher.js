function ClipSwitcher(options) {
    Widget.call(this, options);

    this.active = 0;

    for (var i = 0; i < 8; i++) {
        this.add({
            type: ClipButton,
            label: i.toString(),
            clip: i,
            callback: this.onButtonClick.bind(this)
        });
    }
}

ClipSwitcher.prototype = {
    __proto__: Widget.prototype,

    draw: function() {      
        var w = this.width() / 8;
        var x = 0;
        this.attr('class', 'clipswitcher');

        for (var i = 0; i < 8; i++, x += w) {           
            this.children[i].set({
                x: x, 
                y: 0,
                width: w, 
                height: this.height(),
                opacity: i == this.active ? 1 : 0.5
            });

            this.children[i].draw();
        }
    },

    onButtonClick: function(clip) {
        this.active = clip;
        this.instrument.sequencer.clip(this.active);
        this.instrument.send('/clip', 'i', this.active);
        this.redraw();
    },

    clip: function(clip) {
        this.active = clip;
        this.redraw();
    }
};


function ClipButton(options) {
    Widget.call(this, options);
}

ClipButton.prototype = {
    __proto__: Widget.prototype,

    draw: function() {
        this.attr('class', 'button');
        this.border = this.rect(0, 0, this.width(), this.height(), 0, 0);
        this.text(5, this.height() / 2 + 4, this.label, { 'class': 'label' });
    },

    onTouchDown: function(event) {
        this.callback(this.clip);
        return true;
    }
};
