function Menu(options) {
    this.visible = false;
    this._buttons = [];
    this._options = [];
    this.label = "";

    Widget.call(this, options);
} 

Menu.prototype = {
    __proto__: Widget.prototype,

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

        for (var i in options) {
            this.addButton({
                type: MenuButton,
                value: options[i]
            });
        }
    },        

    show: function() { 
        var x = this.pageX();
        var y = this.pageY() + this.height() + 10;
        var w = this.width();
        var h = this.height();

        for (var i = 0; i < this._options.length; i++, y += h) {         
            var button = $.extend({
                x: x,
                y: y,
                width: w,
                height: h,
                callback: this.onButtonClick.bind(this)             
            }, this._options[i]);

            this._buttons[i] = this.root().add(button);
            this._buttons[i].draw();
        }

        this.visible = true;
    },

    hide: function(event) {
        for (var i in this._buttons) {
            this.root().remove(this._buttons[i]);
        }
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
};


function MenuButton(options) {
    Widget.call(this, options);
    this.visible = false;
}

MenuButton.prototype = {
    __proto__: Widget.prototype,

    draw: function() {
        this.attr('class', 'menu-button');
        this.rect(0, 0, this.width(), this.height(), 0, 0);
        this.text(5, this.height() / 2 + 4, this.value, { 'class': 'label' });
    },

    onTouchDown: function(event) {
        this.callback(this.value);
        return true;
    }
};
