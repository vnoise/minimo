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

    this.clips = this.container.find('.clips a');

    this.clips.each(function(index, link) {
        $(link).click(this.onClickClip.bind(this, index, link));
    }.bind(this));

    this.automation = {};

    $.each(['attack', 'freq', 'decay'], function(i, key) {
        this.automation[key] = new Automation(this, this.container.find('.automation.' + key).get(0), key);
    }.bind(this));

    this.volume = new Slider(this, 'volume', 1);
    this.sinus  = new Slider(this, 'sinus', 1);
    this.freq   = new Slider(this, 'freq', 500);
    this.noise  = new Slider(this, 'noise', 1);
    this.attack = new Slider(this, 'attack', 500);
    this.decay  = new Slider(this, 'decay', 500);
}

Instrument.prototype.onClickClip = function(index, link, event) {
    this.setClip(index);

    send('clip', this.index, index);

    return false;
};

Instrument.prototype.clock = function(index) {
    this.sequencer.clock(index);

    for (var key in this.automation) {
        this.automation[key].clock(index);
    }
};

Instrument.prototype.setClip = function(clip) {
    this.clips.removeClass('active');
    $(this.clips.get(clip)).addClass('active');

    this.sequencer.setClip(clip);

    for (var key in this.automation) {
        this.automation[key].setClip(clip);
    }
};

function Automation(instrument, container, key) {
    this.instrument = instrument;
    this.container = container;
    this.key = key;
    this.canvas = Raphael(this.container, 320, 200);
    this.pattern = [];
    this.clockPattern = [];
    this.stepPattern = [];
    this.clip = 0;

    for (var i = 0; i < 16; i++) {
        this.pattern[i] = [];
        for (var j = 0; j < 16; j++) {
            this.pattern[i][j] = 0;
        }
    }

    this.draw();
}

Automation.prototype.draw = function() {
    for (var x = 0, i = 0; x < 320; x += 20, i += 1) {
        this.stepPattern[i] = this.canvas.rect(x, 200, 20, 200).attr({
            fill: "#faa",
            stroke: "none",
            opacity: 1
        });

        this.clockPattern[i] = this.canvas.rect(x, 0, 20, 200).
            attr({ fill: '#999', opacity: i % 4 == 0 ? 0.5 : 0.2 }).
            mousedown(this.onClickCell.bind(this, i)).
            mousemove(this.onMouseMove.bind(this, i)).
            mouseup(this.onMouseUp.bind(this, i));
    }
};

Automation.prototype.send = function(index) {
    send('automation', this.instrument.index, this.clip, this.key, index, this.pattern[this.clip][index]);
};

Automation.prototype.onClickCell = function(index, event) {
    this.mouseDown = true;
    this.setStep(this.clip, index, 1 - event.offsetY / 200);    
    this.send(index);

    return false;
};

Automation.prototype.onMouseMove = function(index, event) {
    if (this.mouseDown) {
        this.setStep(this.clip, index, 1 - event.offsetY / 200); 
        this.send(index);
    }

    return false;
};

Automation.prototype.onMouseUp = function(index, event) {
    this.mouseDown = false;

    return false;
};

Automation.prototype.setStep = function(clip, index, value) {
    if (Math.abs(this.pattern[clip][index] - value) >= 0.02) {
        this.pattern[clip][index] = value;

        if (this.clip == clip) {
            this.stepPattern[index].attr('y', 200 - value * 200);        
        }        
    }
};

Automation.prototype.clock = function(index) {
    this.clockPattern[index].
        attr({ opacity: 1 }).
        animate({ opacity: index % 4 == 0 ? 0.5 : 0.2 }, 400);
};

Automation.prototype.setClip = function(clip) {
    this.clip = clip;

    for (var i = 0; i < 16; i++) {
        this.stepPattern[i].attr('y', 200 - this.pattern[this.clip][i] * 200);        
    }
};


function Sequencer(instrument, container) {
    this.instrument = instrument;
    this.container = container;
    this.canvas = Raphael(this.container, 320, 200);
    this.pattern = [];
    this.clockPattern = [];
    this.stepPattern = [];
    this.clip = 0;

    for (var i = 0; i < 16; i++) {
        this.pattern[i] = [];
        for (var j = 0; j < 16; j++) {
            this.pattern[i][j] = 0;
        }
    }

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
        this.setStep(this.clip, index, 0);
    }
    else {
        this.setStep(this.clip, index, this.pattern[this.clip][index] + 0.5);
    }

    send('pattern', this.instrument.index, this.clip, index, this.pattern[this.clip][index]);

    return false;
};

Sequencer.prototype.setStep = function(clip, index, value) {
    this.pattern[clip][index] = value;

    if (clip == this.clip) {
        this.stepPattern[index].scale(2).animate({ scale: 1, opacity: value }, 400);        
    }
};

Sequencer.prototype.clock = function(index) {
    this.clockPattern[index].
        scale(10).
        animate({ scale: 1 }, 400);
};

Sequencer.prototype.setClip = function(clip) {
    this.clip = clip;

    for (var i = 0; i < 16; i++) {
        this.stepPattern[i].attr('opacity', this.pattern[this.clip][i]);
    }
};


function Slider(instrument, key, max) {
    this.max = max;
    this.instrument = instrument;
    this.key = key;
    this.container = this.instrument.container.find('.slider.' + key);
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
    this.mouseDown = true;
    this.handleEvent(event);

    return false;
};

Slider.prototype.onMouseUp = function(event) {
    this.mouseDown = false;  

    return false;
};

Slider.prototype.onMouseMove = function(event) {
    if (this.mouseDown) {
        this.handleEvent(event);
    }

    return false;
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

    '/pattern': function(instrument, clip, index, value) {
        instruments[instrument].sequencer.setStep(clip, index, value);
    },

    '/automation': function(instrument, key, clip, index, value) {
        instruments[instrument].automation[key].setStep(clip, index, value);
    },

    '/clip': function(instrument, clip) {
        instruments[instrument].setClip(clip);
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
    function captureEvents(){
        return false;
    }

    document.onselectstart = captureEvents;
    document.onselect = captureEvents;

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