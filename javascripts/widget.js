var Widget = function(options) {
    this.children = [];

    if (!options.svg) {
        options.svg = options.parent.svg;
    }

    this.canvas = options.svg.svg(options.container);

    this.set(options);
    this.canvas.addEventListener('mousedown', this._onTouchDown.bind(this), false);
};

Widget.prototype = {

    canvasAttr: {
        'x': 'float', 
        'y': 'float', 
        'width': 'float', 
        'height': 'float', 
        'opacity': 'float'
    },

    createEvent :function(event) {
        var offset = $(this.svg.root()).offset();

        return {
            localX: event.pageX - offset.left - this.pageX(),
            localY: event.pageY - offset.top - this.pageY()
        };
    },

    _onTouchDown: function(event) {
        event.preventDefault();

        this.__onTouchMove = this._onTouchMove.bind(this);
        this.__onTouchUp = this._onTouchUp.bind(this);

        document.addEventListener('mousemove', this.__onTouchMove, false);
        document.addEventListener('mouseup', this.__onTouchUp, false);

        return this.onTouchDown(this.createEvent(event));
    },

    _onTouchMove: function(event) {
        event.preventDefault();

        return this.onTouchMove(this.createEvent(event));
    },

    _onTouchUp: function(event) {
        event.preventDefault();

        document.removeEventListener('mousemove', this.__onTouchMove, false);
        document.removeEventListener('mouseup', this.__onTouchUp, false);

        return this.onTouchUp(this.createEvent(event));
    },

    onTouchDown: function(event) {
    },

    onTouchMove: function(event) {
    },

    onTouchUp: function(event) {
    },

    handleEvent: function(event) {
        return false;
    },

    clear: function() {
        while (this.canvas.childNodes.length >= 1) {
            this.canvas.removeChild(this.canvas.firstChild); 
        }
    },

    set: function(options) {
        for (var name in options) {
            if (this.canvasAttr[name]) {
                this.attr(name, options[name]);
            } 
            else {
                this[name] = options[name];
            }
        }
    },

    add: function(options) {
        var child = new options.type($.extend({
            svg: this.svg,
            parent: this,
            container: this.canvas,
        }, options));

        this.children.push(child);
        return child;
    },

    child: function(key) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].key == key) {
                return this.children[i];
            }    
        }
        return null;
    },

    attr: function(key, val) {
        if (key.constructor == Object) {
            for (var k in key) {
                this.canvas.setAttribute(k, key[k]);
            }
            return this;
        }

        if (val === undefined) {
            return this.canvas.getAttribute(key);
        }
        
        this.canvas.setAttribute(key, val);
        return this;
    },

    pos: function(x, y) {
        if (x === undefined) {
            return [this.x(), this.y()];
        }
        else {
            this.attr({ x: x, y: y });
            return this;
        }
    },

    extent: function(x, y, w, h) {
        if (x === undefined) {
            return [this.x(), this.y(), this.width(), this.height()];           
        }
        else {
            this.attr({ x: x, y: y, width: w, height: h });
            return this;
        }
    },

    size: function(w, h) {
        if (w  === undefined) {
            return [this.getWidth(), this.getHeight()];
        }
        else {
            this.attr({ width: w, height: h});
            return this;
        }
    },

    pageX: function() {
        if (this.parent) {
            return this.parent.pageX() + this.x();
        }
        else {
            return this.x();
        }
    },

    pageY: function() {
        if (this.parent) {
            return this.parent.pageY() + this.y();
        }
        else {
            return this.y();
        }
    },

    rect: function(x, y, width, height, rx, ry, settings) {
        return this.svg.rect(this.canvas, x, y, width, height, rx, ry, settings);
    },

    circle: function(cx, cy, r, settings) {
        return this.svg.circle(this.canvas, cx, cy, r, settings);
    },

    ellipse: function(cx, cy, rx, ry, settings) {
        return this.svg.circle(this.canvas, cx, cy, rx, ry, settings);
    },

    line: function(x1, y1, x2, y2, settings) {
        return this.svg.circle(this.canvas, x1, y1, x2, y2, settings);
    },

    text: function(x, y, value, settings) {
        return this.svg.text(this.canvas, x, y, value, settings);
    },

    link: function(ref, settings) {
        return this.svg.link(this.canvas, ref, settings);
    },

    image: function(x, y, width, height, ref, settings) {
        return this.svg.image(this.canvas, x, y, width, height, ref, settings);        
    },

    path: function(path, settings) {
        return this.svg.path(this.canvas, path, settings);
    },

    polyline: function(points, settings) {
        return this.svg.path(this.canvas, points, settings);       
    }

};

Widget.defaultAccessor = function(name) {
    return function(val) {
        if (val === undefined) {
            return this.canvas.getAttribute(name);
        }
        else {
            this.canvas.setAttribute(name, val);
            return this;
        }
    };
};

Widget.floatAccessor = function(name) {
    return function(val) {
        if (val === undefined) {
            return parseFloat(this.canvas.getAttribute(name));
        }
        else {
            this.canvas.setAttribute(name, val);
            return this;
        }
    };
};

Widget.accessor = function(name, type) {
    switch (type) {
    case 'float': return this.floatAccessor(name);
    default: return this.defaultAccessor(name);
    }
};


for (var name in Widget.prototype.canvasAttr) {
    Widget.prototype[name] = Widget.accessor(name, Widget.prototype.canvasAttr[name]);
}
