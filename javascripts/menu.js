function Menu(options) {
    Widget.call(this, options);

    this.visible = false;
    this.buttons = [];
    this.label = "";

    for (var i = 0; i < this.options.length; i++) {     
        this.add({
            type: MenuButton,
            label: this.options[i],
            value: this.options[i],
            callback: this.callback
        });
    }
}

Menu.prototype = {
    __proto__: Widget.prototype,

    setLabel: function(label) {
        this.label = label;

        if (this.textLabel) {
            this.textLabel.childNodes[0].nodeValue = label;
        }
    },

    draw: function() {
        this.attr('class', 'menu');
        this.rect(0, 0, this.width(), this.height(), 0, 0);
        this.textLabel = this.text(5, this.height() / 2 + 4, this.label, { 'class': 'label' });

        var h = this.height();
        var w = this.width();
        var y = 0;

        for (var i = 0; i < this.children.length; i++, y += h) {     
            this.children[i].extent(0, y, w, h).draw();
        }
    },

    show: function(event) { 
        this.visible = true;
        this._height = this.height();
        this.height(this.children.length * this.height());
    },

    hide: function(event) {
        this.visible = false;
        this.height(this._height);
    },

    onTouchDown: function(event) {
        if (!this.visible) {
            this.show();
            return true         
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
        this.attr('class', 'button');

        this.rect(0, 0, this.width(), this.height(), 0, 0);
        this.text(5, this.height() / 2 + 4, this.label, { 'class': 'label' });
    },

    show: function() {
        this.visible = true;
        this.svg.animate.start(this.canvas, { opacity: 1 }, 100);
    },

    hide: function() {
        this.visible = false;
        this.svg.animate.start(this.canvas, { opacity: 0 }, 100);            
    },

    onTouchDown: function(event) {
        setTimeout(this.parent.hide.bind(this.parent), 10);

        this.parent.setLabel(this.label);
        this.callback(this.value);

        return true;
    }
};
