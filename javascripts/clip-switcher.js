var ClipSwitcher = new Class({
    Extends: Widget,

    initialize: function(options) {
        Widget.prototype.initialize.call(this, options);

        this.active = 0;
        this.layout = 'horizontal';

        for (var i = 0; i < 8; i++) {
            this.add({
                active: i == 0,
                type: ClipButton,
                label: i.toString(),
                marginRight: 1,
                clip: i,
                on: {
                    click: this.onButtonClick.bind(this)
                }
            });
        }
    },

    onButtonClick: function(clip) {
        this.clip(clip);
        this.instrument.sequencer.clip(this.active);
        this.instrument.send('/clip', 'i', this.active);
    },

    clip: function(clip) {
        this.active = clip;
        this.children.each(function(child, i) {
            child.active = i == this.active;
        }, this);
    }
});


var ClipButton = new Class({
    Extends: Button,

    drawCanvas: function(context) {
        this.drawBackground(context, this.active ? this.fgColor : this.bgColor);
        this.drawLabel(context);
    },

    onTouchDown: function(event) {
        this.fireEvent('click', this.clip);
        return true;
    }
});
