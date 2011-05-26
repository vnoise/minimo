var ClipSwitcher = new Class({
    Extends: Widget,

    initialize: function(options) {
        Widget.prototype.initialize.call(this, options);

        this.active = 0;
        this.layout = 'horizontal';

        for (var i = 0; i < 8; i++) {
            this.add({
                type: ClipButton,
                label: i.toString(),
                clip: i,
                on: {
                    click: this.onButtonClick.bind(this)
                }
            });
        }
    },

    draw: function() {      
        this.attr('class', 'clipswitcher');
        Widget.prototype.draw.call(this);
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
        this.fireEvent('click', this.clip);
        return true;
    }
});
