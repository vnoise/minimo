function Menu(svg, instrument, options) {
    this.svg = svg;
    this.instrument = instrument;
    this.visible = false;
    this.buttons = [];
    this.set(options);

    for (var i = 0; i < this.options.length; i++) {     
        this.buttons[i] = new MenuButton(this.svg, this, {
            text: this.options[i],
            value: this.options[i],
            callback: this.callback
        });
    }
}

Menu.prototype.set = function(options) {
    for (var name in options) {
        this[name] = options[name];
    }
};

Menu.prototype.setLabel = function(text) {
    this.text = text;
    this.drawLabel();
};

Menu.prototype.draw = function() {
    this.svg.rect(this.x, this.y, this.width, this.height, 0, 0, {
        'class': 'menu'
    });

    this.drawLabel();

    var y = this.y + this.height;

    for (var i = 0; i < this.options.length; i++, y += this.height) {     
        this.buttons[i].set({
            x: this.x, 
            y: y, 
            width: this.width, 
            height: this.height
        });

        this.buttons[i].draw();
    }

    TouchTracker.add(this);
};

Menu.prototype.drawLabel = function() {
    if (this.label) {
        $(this.label).remove();
    }

    if (this.text) {
        this.label = this.svg.text(this.x + 5, this.y + this.height / 2 + 4, this.text, { 
            'class': 'menu-label' 
        });
    }
};

Menu.prototype.show = function(event) { 
    this.visible = true;

    for (var i = 0; i < this.options.length; i++) {
        this.buttons[i].show();
    }

    TouchTracker.active = this.buttons;
};

Menu.prototype.hide = function(event) {
    this.visible = false;

    for (var i = 0; i < this.options.length; i++) {
        this.buttons[i].hide();
    }

    TouchTracker.active = TouchTracker.components;
};

Menu.prototype.handleEvent = function(event) {
    if (this.visible) {
        this.hide();
    }
    else {
        this.show();
    }

    return true;
};


function MenuButton(svg, menu, options) {
    this.svg = svg;
    this.menu = menu;
    this.visible = false;
    this.set(options);
}

MenuButton.prototype.set = function(options) {
    for (var name in options) {
        this[name] = options[name];
    }
};

MenuButton.prototype.draw = function() {
    this.button = this.svg.rect(this.x, this.y, this.width, this.height, 0, 0, {
        'class': 'menu-button',
        opacity: 0
    });

    this.label = this.svg.text(this.x + 5, this.y + this.height / 2 + 4, this.text, { 
        'class': 'menu-button-label',
        opacity: 0
    });

    TouchTracker.add(this);
};

MenuButton.prototype.show = function() {
    this.visible = true;
    this.svg.root().appendChild(this.button);
    this.svg.root().appendChild(this.label);
    this.svg.animate.start(this.button, { opacity: 1 }, 100);
    this.svg.animate.start(this.label, { opacity: 1 }, 100);  
};

MenuButton.prototype.hide = function() {
    this.visible = false;
    this.svg.animate.start(this.button, { opacity: 0 }, 100);        
    this.svg.animate.start(this.label, { opacity: 0 }, 100);            
};

MenuButton.prototype.handleEvent = function(event) {
    if (this.visible) {
        this.svg.root().appendChild(this.button);
        this.svg.root().appendChild(this.label);
        this.menu.hide();
        this.menu.setLabel(this.text);
        this.callback(this.value);

        return true;
    }
    else {
        return false;
    }
};
