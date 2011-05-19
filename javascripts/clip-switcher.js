var ClipSwitcher = new Class({
    Extends: Widget,

    initialize: function(options) {
        Widget.prototype.initialize.call(this, options);

        this.active = 0;

        for (var i = 0; i < 8; i++) {
            this.add({
                type: ClipButton,
                label: i.toString(),
                clip: i,
                callback: this.onButtonClick.bind(this)
            });
        }
    },

    draw: function() {      
        var w = this.width() / 8;
        var x = 0;
        this.attr('class', 'clipswitcher');

        for (var i = 0; i < 8; i++, x += w) {
            this.children[i].set({
                x: x, 
                y: 0,
                width: w, 
                height: this.height()
            });

            this.children[i].draw();
        }
    },

    onButtonClick: function(clip) {
        this.active = clip;
        this.instrument.sequencer.clip(this.active);
        this.instrument.send('/clip', 'i', this.active);
        this.drawActive();
    },

    drawActive: function() {
        this.children.each(function(child, i) {
            child.attr('opacity', i == this.active ? 1 : 0.5);
        }, this);
    },

    clip: function(clip) {
        this.active = clip;
        this.drawActive();
    }
});


var ClipButton = new Class({
    Extends: Widget,

    draw: function() {
        this.attr('class', 'button');
        this.border = this.rect(0, 0, this.width(), this.height(), 0, 0);
        this.text(5, this.height() / 2 + 4, this.label, { 'class': 'label' });
    },

    onTouchDown: function(event) {
        this.callback(this.clip);
        return true;
    }
});
