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
                marginRight: 5,
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
    Extends: Widget,

    drawCanvas: function(context) {
        context.font = "20px Helvetica";
        context.fillStyle = this.active ? "#f00" : "#009";
        context.fillRect(0, 0, this.width(), this.height());
        context.fillStyle = "#fff";
        context.fillText(this.label, this.width() / 2 - 5, this.height() / 2 + 5);
    },

    onTouchDown: function(event) {
        this.fireEvent('click', this.clip);
        return true;
    }
});
