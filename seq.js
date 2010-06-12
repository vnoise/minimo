Function.prototype.bind = function(object) {
    var fn = this;
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
}

function p(s) {
    $('#console').html(s);
}

function Instrument(key, index) {
    this.key = key;
    this.index = index;
    this.container = $('.instrument.' + key);
    this.sequencer = this.container.find('.sequencer');

    this.initSequencer();

    this.volume = new Slider(this, 'volume', 1);
    this.sinus  = new Slider(this, 'sinus', 1);
    this.freq   = new Slider(this, 'freq', 500);
    this.noise  = new Slider(this, 'noise', 1);
    this.attack = new Slider(this, 'attack', 500);
    this.delay  = new Slider(this, 'decay', 500);
 }

Instrument.prototype.initSequencer = function() {
    this.pattern = this.sequencer.find('.pattern');
    var instrument = this.index;

    this.pattern.click(this.onClickPattern.bind(this));
};

Instrument.prototype.onClickPattern = function(event) {
    var element = $(event.target);
    element.toggleClass('active');

    var index = this.pattern.index(event.target);
    var value = element.hasClass('active') ? 1 : 0;
    
    $.post('/osc/send/' + client_id + '/pattern/iif/' + this.index + '/' + index + '/' + value);
};

Instrument.prototype.clock = function(index) {
    this.pattern.removeClass('current');
    $(this.pattern.get(index)).addClass('current');
};

Instrument.prototype.setPattern = function(index, value) {
    var element = $(this.pattern.get(index));

    if (value == 1) {        
        element.addClass('active');
    }
    else {
        element.removeClass('active');            
    }
};


function Slider(instrument, key, max) {
    this.max = max;
    this.instrument = instrument;
    this.key = key;
    this.container = this.instrument.container.find('.' + key);
    this.handle = this.container.find('.handle');
    this.mouseDown = false;

    this.container.bind('mousedown', this.onMouseDown.bind(this));
    this.container.bind('mouseup', this.onMouseUp.bind(this));
    this.container.bind('mousemove', this.onMouseMove.bind(this));
}

Slider.prototype.setValue = function(value) {
    var left = this.container.width() * (value / this.max);
    this.handle.css('marginLeft', left + 'px');    
};

Slider.prototype.handleMouse = function(event) {
    event.preventDefault();

    var sliderWidth = this.container.width();
    var sliderLeft = this.container.offset().left;
    var sliderRight = sliderLeft + sliderWidth;
    var left = event.pageX - sliderLeft - this.handle.width() / 2;

    left = Math.min(Math.max(0, left), sliderRight - this.handle.width());
    this.handle.css('marginLeft', left + 'px');

    var value = (left / sliderWidth) * this.max;

    $.post('/osc/send/' + client_id + '/' + this.key + '/if/' + this.instrument.index + '/' + value);
};

Slider.prototype.onMouseDown = function(event) {
    this.mouseDown = true;
    this.handleMouse(event);
};

Slider.prototype.onMouseUp = function(event) {
    this.mouseDown = false;  
};

Slider.prototype.onMouseMove = function(event) {
    if (this.mouseDown) {
        this.handleMouse(event);
    }
};
        
        // handle.ontouchmove = function(e) {            
        //     var handleWidth = $(this).width();

        //     for (var i = 0; i < e.changedTouches.length; i++) {                
        //         e.preventDefault();

        //         var touch = e.changedTouches[i];
        //         var left = touch.pageX - sliderLeft;
        //         var value = x / sliderWidth;

        //         this.style.left = left - handleWidth / 2 + 'px';

        //         $.post('/osc/send/' + client_id + '/' + message + '/if/' + instrument + '/' + value);
        //     }
        // };

var controller = {
    '/clock': function(index) {
        $.each(instruments, function() {
           this.clock(index); 
        });
    },
    '/pattern': function(instrument, index, value) {
        instruments[instrument].setPattern(index, value);
    }
};

$.each(['volume', 'sinus', 'freq', 'noise', 'attack', 'decay'], function(index, key) {
    controller['/' + key] = function(index, value) {
        instruments[index][key].setValue(value);
    };
});

function receive(path, callback) {
    $.get(path, null, function(messages) {        
        messages = eval('(' + messages + ')');
        for (var i = 0; i < messages.length; i++) {
            var message = messages[i];
            var fun = controller[message.address];
            if (fun) {
                fun.apply(this, message.args);
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

    receive('/osc/receive/' + client_id, receive);

    // receive('machine1.js');
});
