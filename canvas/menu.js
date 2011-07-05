var Menu = new Class({
    Extends: Widget,

    initialize: function(options) {
        this._options = [];
        this._value = "";       
        this.fontColor = '#ffffff';
        this.fgColor = '#0b9eff';
        this.bgColor = '#3a3637';
        this.on('select', this.onSelect.bind(this));

        Widget.prototype.initialize.call(this, options);
    },

    value: function(value) {
        if (value === undefined) {
            return this._value;
        }
        else {
            this._value = value;
        }
    },

    drawCanvas: function(context) {
        context.fillStyle = this.bgColor;
        context.fillRect(0, 0, this.width, this.height);
        context.font = (this.height / 2) + "px Arial";
        context.fillStyle = this.fontColor;
        context.fillText(this._value, 10, 20);
    },

    options: function(options) {
        this._options = options;
    },        

    onTouchDown: function(event) {
        for (var i = 0; i < this._options.length; i++) {
            if (this._value == this._options[i]) {
                this._value = this._options[(i + 1) % this._options.length];
                break;
            }
        }

        this.fireEvent('select', this._value);

        return true;         
    },

    onSelect: function(value) {
    }
});

