Function.prototype.bind = function(object) {
    var fn = this;
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
}

function p(s) {
    $('#console').append("<" + s + "> ");
}


function Instrument(key, index) {
    this.key = key;
    this.index = index;
    this.container = $('.instrument.' + key);
    this.sequencer = new Sequencer(this, this.container.find('.sequencer').get(0));

    this.automation = {};

    $.each(['attack', 'freq', 'decay'], function(i, key) {
        this.automation[key] = new Sequencer(this, this.container.find('.automation.' + key).get(0), key);
    }.bind(this));

    this.volume = new Slider(this, 'volume', 1);
    this.sinus  = new Slider(this, 'sinus', 1);
    this.freq   = new Slider(this, 'freq', 500);
    this.noise  = new Slider(this, 'noise', 1);
    this.attack = new Slider(this, 'attack', 500);
    this.decay  = new Slider(this, 'decay', 500);
}

Instrument.prototype.clock = function(index) {
    this.sequencer.clock(index);

    for (var key in this.automation) {
        this.automation[key].clock(index);
    }
};


function Sequencer(instrument, container, key) {
    this.instrument = instrument;
    this.container = container;
    this.key = key;
    this.canvas = Raphael(this.container, 320, 200);
    this.pattern = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.clockPattern = [];
    this.stepPattern = [];

    this.draw();
}

Sequencer.prototype.draw = function() {
    for (var y = 40, i = 0; y < 200; y += 40) {
        for (var x = 40; x < 320; x += 80, i += 1) {
            this.clockPattern[i] = this.canvas.circle(x, y, 1).attr({
                fill: "#afa",
                stroke: "none"
            });
            this.stepPattern[i] = this.canvas.circle(x, y, 16).attr({
                fill: "#faa",
                stroke: "none",
                opacity: 0
            }).click(this.onClickCell.bind(this, i));
        }
    }
};

Sequencer.prototype.onClickCell = function(index, event) {
    if (this.pattern[index] == 1) {
        this.setStep(index, 0);
    }
    else {
        this.setStep(index, this.pattern[index] + 0.5);
    }
    
    if (this.key) {
        send('automation', this.instrument.index, this.key, index, this.pattern[index]);                
    }
    else {
        send('pattern', this.instrument.index, index, this.pattern[index]);                
    }
};

Sequencer.prototype.setStep = function(index, value) {
    this.pattern[index] = value;
    this.stepPattern[index].
        scale(2).
        animate({ scale: 1, opacity: value }, 400);
};

Sequencer.prototype.clock = function(index) {
    this.clockPattern[index].
        scale(10).
        animate({ scale: 1 }, 400);
};

function Slider(instrument, key, max) {
    this.max = max;
    this.instrument = instrument;
    this.key = key;
    this.container = this.instrument.container.find('.' + key);
    this.range = this.container.find('.range');
    this.handle = this.container.find('.handle');
    this.mouseDown = false;
    this.left = 0;

    this.container.bind('mousedown', this.onMouseDown.bind(this));
    this.container.bind('mouseup', this.onMouseUp.bind(this));
    this.container.bind('mousemove', this.onMouseMove.bind(this));

    this.handle.get(0).ontouchmove = this.onTouchMove.bind(this);
}

Slider.prototype.setValue = function(value) {
    if (value >= 0 && value <= this.max) {
        this.value = value;
        this.left = this.range.width() * (value / this.max);
        this.handle.css('marginLeft', this.left + 'px');            
    }
};

Slider.prototype.handleEvent = function(event) {
    var sliderWidth = this.range.width();
    var sliderLeft = this.range.offset().left;
    var sliderRight = sliderLeft + sliderWidth;
    var left = event.pageX - sliderLeft - this.handle.width() / 2;
    var value = (left / sliderWidth) * this.max;

    if (Math.abs(this.left - left) >= 10) {        
        this.setValue(value);

        send('parameter', this.instrument.index, this.key, this.value);
    }
};

Slider.prototype.onMouseDown = function(event) {
    event.preventDefault();

    this.mouseDown = true;
    this.handleEvent(event);
};

Slider.prototype.onMouseUp = function(event) {
    event.preventDefault();

    this.mouseDown = false;  
};

Slider.prototype.onMouseMove = function(event) {
    if (this.mouseDown) {
        this.handleEvent(event);
    }
};

Slider.prototype.onTouchMove = function(event) {
    event.preventDefault();

    for (var i = 0; i < event.changedTouches.length; i++) {
        this.handleEvent(event.changedTouches[i]);
    }
};

var controller = {
    clock: 0,

    setClock: function (clock) {
        $.each(instruments, function() {
            this.clock(clock % 16); 
        });

        if (clock % 4 < 3) {
            setTimeout(this.setClock.bind(this, clock + 1), 125);
        }
    },

    '/clock': function(index) {
        this.setClock(index);
    },

    '/parameter': function(instrument, key, value) {
        instruments[instrument][key].setValue(value);        
    },

    '/pattern': function(instrument, index, value) {
        instruments[instrument].sequencer.setStep(index, value);
    }
};

function send(path) {
    var args = Array.prototype.slice.call(arguments, 0);

    $.post('/send/' + client_id + '/' + args.join('/'));
};

function receive(path, callback) {
    $.get(path, null, function(messages) {        
        messages = eval('(' + messages + ')');
        for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            var fun = controller[message.address];
            if (fun) {
                fun.apply(controller, message.args);
            }
            else {
                if (console)
                    console.log('unsupported message:' + message.address);
            }
        }
        callback(path, callback);
    });    
}


$(function() {
    document.body.ongesturechange = function(e) {
        e.preventDefault();
    };
    document.body.ongesturestart = function(e) {
        e.preventDefault();
    };

    window.instruments = [
        new Instrument('bd', 0),
        new Instrument('sd', 1),
        new Instrument('hh', 2)
    ];

    receive('/receive/' + client_id, receive);

    // receive('machine1.js');


});