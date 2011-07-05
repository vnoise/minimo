var Sequencer = new Class({
    Extends: Widget,

    initialize: function(options) {
        Widget.prototype.initialize.call(this, options);

        this._pattern = [];
        this._clocks = [];
        this._steps = [];
        this._clip = 0;
        this.layout = 'horizontal';
        this.clockColor = '#fff';

        for (var i = 0; i < 8; i++) {
            this._pattern[i] = [];
            for (var j = 0; j < 16; j++) {
                this._pattern[i][j] = 0;
            }
        }

        for (var i = 0; i < 16; i++) {
            this.add({
                type: SequencerButton,
                marginRight: 1,
                step: i,
                on: {
                    click: this.onButtonClick.bind(this)
                }
            });
        }
    },

    drawCanvas: function(context) {
        context.fillStyle = this.clockColor;
        context.fillRect(this._clock * this.width / 16, 0, 2, this.height);
    },

    onButtonClick: function(index, value) {
        this._pattern[this._clip][index] = value;
        this.instrument.send('/pattern', 'iif', this._clip, index, value);
    },

    setStep: function(clip, index, value) {
        this._pattern[clip][index] = value;

        if (this._clip == clip) {
            this.children[index].value = value;
        }
    },

    clip: function(clip) {
        this._clip = clip;

        for (var i = 0; i < 16; i++) {
            this.children[i].value = this._pattern[this._clip][i];          
        }
    },

    clock: function(clock) {
        this._clock = clock % 16;
    }
});


var SequencerButton = new Class({
    Extends: Button,

    initialize: function(options) {
        this.step = 0;
        this.value = 0;
        Button.prototype.initialize.call(this, options);
    },

    drawCanvas: function(context) {
        this.drawBackground(context, this.value == 1 ? this.fgColor : this.bgColor);
    },

    onTouchDown: function(event) {
        this.value = this.value == 1 ? 0 : 1; 
        this.fireEvent("click", [this.step, this.value]);
        return true;
    }

});
