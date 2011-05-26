var WidgetId = 1;

var Widget = new Class({

    Implements: Events,

    initialize: function(options) {
        this.svgNS = 'http://www.w3.org/2000/svg';
        this.xlinkNS = 'http://www.w3.org/1999/xlink';

        this.children = [];
        this.canvas = document.createElementNS(this.svgNS, 'g');

        options.container.appendChild(this.canvas);

        this.id = WidgetId++;
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this._scaleX = 1;
        this._scaleY = 1;

        this.marginTop = 0;
        this.marginBottom = 0;
        this.marginLeft = 0;
        this.marginRight = 0;

        this.sizeHint = 1; 
        this.set(options);
    },

    on: function(event, callback) {
        if (callback) {
            this.addEvent(event, callback);
        }
        else {
            for (var name in event) {
                this.addEvent(name, event[name]);               
            }
        }
    },

    x: function(value) {
        if (value === undefined) {
            return this._x;
        }
        else {
            this._x = value;
        }

        this.updateTransform();
    },

    y: function(value) {
        if (value === undefined) {
            return this._y;
        }
        else {
            this._y = value;
        }

        this.updateTransform();
    },

    width: function(value) {
        if (value === undefined) {
            return this._width;
        }
        else {
            this._width = value;
        }
    },

    height: function(value) {
        if (value === undefined) {
            return this._height;
        }
        else {
            this._height = value;
        }
    },
    
    updateTransform: function() {
        this.attr('transform', 
                  'translate(' + this._x + ',' + this._y + ') ' +
                  'scale(' + this._scaleX + ',' + this._scaleY + ')');
    },

    translate: function(x, y) {
        if (x === undefined) {
            var matrix = this.transform(0).matrix;
            return [matrix.e, matrix.f];
        }
        else {
            this.transform(0).setTranslate(x, y);
            return this;            
        }
    },

    scale: function(sx, sy) {
        if (sx === undefined) {
            var matrix = this.transform(1).matrix;
            return [matrix.a, matrix.d];
        }
        else {
            this.transform(1).setScale(sx, sy);
            return this;            
        }
    },

    animate: function(element, attributes, duration) {
        var iteration = 0;
        var steps = duration / 50;
        var values = {};
        var step = {};
        var name;

        for (name in attributes) {
            values[name] = parseFloat(element.getAttribute(name));
        }

        for (name in attributes) {
            step[name] = (attributes[name] - values[name]) / steps;
        }

        var interval = setInterval(function() {
            iteration += 1;
            
            var value;
            
            if (iteration == steps) {
                clearInterval(interval);
                for (name in attributes) {
                    element.setAttribute(name, attributes[name]);
                }
            }
            else {
                for (name in attributes) {
                    value = (values[name] += step[name]);
                    value = Math.max(0, value);
                    element.setAttribute(name, value);
                }            
            }
        }, 50);
    },

    onTouchDown: function(event) {
        return false;
    },

    onTouchMove: function(event) {
        return false;
    },

    onTouchUp: function(event) {
        return false;
    },

    clear: function() {
        var nodes = [];
        var children = this.canvas.childNodes;

        for (var i = 0; i < children.length; i++) {
            if (children[i].tagName != 'g') {
                nodes.push(children[i]);
            }
        }

        for (var i = 0; i < nodes.length; i++) {        
            this.canvas.removeChild(nodes[i]); 
        }

        for (var i = 0; i < this.children.length; i++) {
            this.children[i].clear();
        }
    },

    doLayout: function() {
        switch (this.layout) {
        case 'horizontal': 
            this.doHorizontalLayout();
            break;
        case 'vertical': 
            this.doVerticalLayout();
            break;
        }

        this.children.each(function(child) {
            child.doLayout();
        });
    },

    sumSizeHints: function() {
        var size = 0;

        this.children.each(function(child) {
            size += child.sizeHint;
        });

        return size;
    },

    sumVerticalMargins: function() {
        var margin = 0;

        this.children.each(function(child) {
            margin += child.marginTop + child.marginBottom;
        });

        return margin;
    },

    sumHorizontalMargins: function() {
        var margin = 0;

        this.children.each(function(child) {
            margin += child.marginLeft + child.marginRight;
        });

        return margin;
    },

    doHorizontalLayout: function() {
        var x = 0;
        var y = 0;
        var width = 0;
        var w = (this.width() - this.sumHorizontalMargins()) / this.sumSizeHints();
        var h = this.height();

        this.children.each(function(child) {
            x += child.marginLeft;
            child.extent(x, y, w * child.sizeHint, h);
            x += child.width();
            x += child.marginRight;
        });
    },

    doVerticalLayout: function() {
        var x = 0;
        var y = 0;
        var w = this.width();
        var h = (this.height() - this.sumVerticalMargins()) / this.sumSizeHints();

        this.children.each(function(child) {
            y += child.marginTop;
            child.extent(x, y, w, h * child.sizeHint);
            y += child.height();
            y += child.marginBottom;
        });
    },

    draw: function() {      
        this.children.each(function(child) {
            child.draw();
        });
    },

    redraw: function() {
        this.clear();
        this.draw();
    },

    set: function(options) {
        for (var name in options) {
            if (name == 'type') {
                continue;
            }

            if (typeof(this[name]) == "function") {
                this[name](options[name]);
            } 
            else {
                this[name] = options[name];
            }
        }
    },

    add: function(options) {
        var type = options.type || Widget;

        options._svg = this._svg;
        options._parent = this;
        options.container = this.canvas;

        var child = new type.prototype.$constructor(options);

        this.children.push(child);

        return child;
    },

    append: function(widget) {
        this.children.push(widget);

        if (widget._parent) {
            widget._parent.remove(widget);
        }

        widget._parent = this;
        this.canvas.appendChild(widget.canvas);
    },

    find: function(id) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].id == id) {
                return i;
            }
        }

        return null;
    },

    remove: function(widget) {
        var index = this.find(widget.id);
        this.children.splice(index, 1);
        this.canvas.removeChild(widget.canvas);
        widget._parent = null;
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
            return [this._x, this._y];
        }
        else {
            this._x = x;
            this._y = y;
            this.updateTransform();
            return this;
        }
    },

    extent: function(x, y, w, h) {
        if (x === undefined) {
            return [this._x, this._y, this._width, this._height]; 
        }
        else {
            this._x = x;
            this._y = y;
            this._width = w;
            this._height = h;
            this.updateTransform();
            return this;
        }
    },

    size: function(w, h) {
        if (w === undefined) {
            return [this._width, this._height];
        }
        else {
            this._width = w;
            this._height = h;
            this.updateTransform();
            return this;
        }
    },

    root: function() {
        if (this._parent) {
            return this._parent.root();
        }
        else {
            return this;
        }
    },

    pageX: function() {
        if (this._parent) {
            return this._parent.pageX() + this.x();
        }
        else {
            return this.x();
        }
    },

    pageY: function() {
        if (this._parent) {
            return this._parent.pageY() + this.y();
        }
        else {
            return this.y();
        }
    },

    createElement: function(name, settings, additional) {
        var node = document.createElementNS(this.svgNS, name);

        for (var name in settings) {
            node.setAttribute(name, settings[name]);
        }

        if (additional) {
            for (var name in additional) {
                node.setAttribute(name, additional[name]);
            }
        }

        this.canvas.appendChild(node);

        return node;
    },

    svg: function(x, y, width, height, settings) {
        return this.createElement('svg', { x: x, y: y, width: width, height: height }, settings);
    },

    rect: function(x, y, width, height, settings) {
        return this.createElement('rect', { x: x, y: y, width: width, height: height }, settings);
    },

    circle: function(cx, cy, r, settings) {
        return this.createElement('circle', { cx: cx, cy: cy, r: r }, settings);
    },

    ellipse: function(cx, cy, rx, ry, settings) {
        return this.createElement('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry }, settings);
    },

    line: function(x1, y1, x2, y2, settings) {
        return this.createElement('line', { x1: x1, y1: y1, x2: x2, y2: y2 }, settings);
    },

    text: function(x, y, value, settings) {
        var node = this.createElement('text', { x: x, y: y }, settings);
        node.appendChild(node.ownerDocument.createTextNode(value));
        return node;
    },

    link: function(ref, settings) {
        var node = this.createElement('link', settings);
        node.setAttributeNS(this.xlinkNS, 'href', ref);
        return node;
    },

    image: function(x, y, width, height, ref, settings) {
        var node = this.createElement('image', { x: x, y: y, width: width, height: height }, settings);
        node.setAttributeNS(this.xlinkNS, 'href', ref);
        return node;        
    },

    path: function(path, settings) {
        return this.createElement('path', { path: path }, settings);
    },

    polyline: function(points, settings) {
        return this.createElement('polyline', { points: points }, settings);       
    }

});
