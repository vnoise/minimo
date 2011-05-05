function SVGTransformer(wrapper) {
    this.wrapper = wrapper;
    this.root = this.wrapper.root();
}

$.extend(SVGTransformer.prototype, {
    
    transform: function(element, index) {
        if (element[0]) {
            element = element[0];
        }

        var list = element.transform.baseVal;

        if (list.numberOfItems == 0) {
            list.appendItem(this.root.createSVGTransform());
            list.appendItem(this.root.createSVGTransform());
        }

        return list.getItem(index);
    },

    offset: function(element) {
        var translate = this.translate(element); 
        var offset = $(this.root).offset();

        return {
            left: offset.left + translate[0],
            top: offset.top + translate[1]
        };
    },

    translate: function(element, x, y) {
        if (x) {
            this.transform(element, 0).setTranslate(x, y);
            return this;            
        }
        else {
            var matrix = this.transform(element, 0).matrix;
            return [matrix.e, matrix.f];
        }
    },

    scale: function(element, sx, sy) {
        if (sx) {
            this.transform(element, 1).setScale(sx, sy);
            return this;            
        }
        else {
            var matrix = this.transform(element, 1).matrix;
            return [matrix.a, matrix.d];
        }
    }
});

$.svg.addExtension('transform', SVGTransformer);

function SVGAnimate(wrapper) {
    this.wrapper = wrapper;
}

SVGAnimate.prototype.start = function(element, attributes, duration) {
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
};

$.svg.addExtension('animate', SVGAnimate);
