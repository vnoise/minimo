var Menu = new Class({
    Extends: Widget,

    initialize: function(options) {
        this.visible = false;
        this._buttons = [];
        this._options = [];
        this.label = "";

        Widget.prototype.initialize.call(this, options);
    },

    setLabel: function(label) {
        this.label = label;
        this.redraw();
    },

    draw: function() {
        this.attr('class', 'menu');
        this.rect(0, 0, this.width(), this.height(), 0, 0);
        this.text(5, this.height() / 2 + 4, this.label, { 'class': 'label' });
    },

    addButton: function(button) {
        this._options.push(button);
    },

    options: function(options) {
        this._options = [];

        options.each(function(value) {
            this.addButton({
                type: MenuButton,
                value: value
            });
        }, this);
    },        

    show: function() { 
        var x = this.pageX();
        var y = this.pageY() + this.height() + 10;
        var w = this.width();
        var h = this.height();

        for (var i = 0; i < this._options.length; i++, y += h) {         
            var button = this._options[i];
            button.x = x;
            button.y = y;
            button.width = w;
            button.height = h;
            button.callback = this.onButtonClick.bind(this);
            this._buttons[i] = this.root().add(button);
            this._buttons[i].draw();
        }

        this.visible = true;
    },

    hide: function(event) {
        this._buttons.each(function(button) {
            this.root().remove(button);
        }, this);
        this._buttons = [];
        this.visible = false;
    },

    onTouchDown: function(event) {
        if (this.visible) {
            this.hide();
        }
        else {
            this.show();
        }
        return true;         
    },

    onButtonClick: function(value) {
        if (this.callback) {
            this.hide();
            this.setLabel(value);
            this.callback(value);
        }
    }
});


var MenuButton = new Class({
    Extends: Widget,

    initialize: function(options) {
        Widget.prototype.initialize.call(this, options);
        this.visible = false;
    },

    draw: function() {
        this.attr('class', 'menu-button');
        this.rect(0, 0, this.width(), this.height(), 0, 0);
        this.text(5, this.height() / 2 + 4, this.value, { 'class': 'label' });
    },

    onTouchDown: function(event) {
        this.callback(this.value);
        return true;
    }
});
