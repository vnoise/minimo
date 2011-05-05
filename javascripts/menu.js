function Menu(options) {
    this.options = [];
    this.visible = false;

    Widget.call(this, options);

    this._buttons = [];
    this.label = "";
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

    show: function() { 
        var x = this.pageX();
        var y = this.pageY() + this.height() + 10;
        var w = this.width();
        var h = this.height();

        for (var i = 0; i < this.options.length; i++, y += h) {     
            this._buttons[i] = this.root().add({
                type: MenuButton,
                x: x,
                y: y,
                width: w,
                height: h,
                value: this.options[i],
                callback: this.onButtonClick.bind(this)
            });     

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
        this.hide();
        this.setLabel(value);
        this.callback(value);
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
