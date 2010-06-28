var controller = {
    clock: 0,
    instruments: [],

    initialize: function() {
        // this.scrollManager = new ScrollManager();
        this.menu = $("<div class='menu'/>").appendTo(document.body);
        this.console = $("<div class='console'/>").appendTo(document.body);

        this.bpm = $('<input type="text" class="bpm" name="bpm" />').appendTo(this.menu);

        this.bpm.keydown(function() {
            this.send('bpm', this.bpm.val());
        }.bind(this));

        $("<a href='#'>console</a>").appendTo(this.menu).click(function() {
            console.slideToggle();
            return false;
        });

        $("<a href='#'>save</a>").appendTo(this.menu).click(function() {
            controller.send('save');
            return false;
        });

        for (var i = 0; i < saves.length; i++) {
            var file = saves[i];
            $("<a href='#'>" + file + "</a>").appendTo(this.menu).click(function() {
                this.load(file);
            }.bind(this));     
        }

        this.sliderSwitcher = new SliderSwitcher(this.instruments);
        this.sliderSwitcher.render(document.body);
        this.receive();
    },

    getBpm: function() {
        return parseFloat(this.bpm.val());
    },

    setClock: function (clock) {
        $.each(this.instruments, function() {
            this.clock(clock % 16); 
        });

        if (clock % 4 < 3) {
            var beat = 60000 / this.getBpm() / 4;
            setTimeout(this.setClock.bind(this, clock + 1), beat);
        }
    },

    '/clock': function(index) {
        this.setClock(index);
    },
    
    '/bpm': function(instrument, bpm) {
        this.bpm.val(bpm);
    },

    '/instrument': function(index) {
        var instrument = this.instruments[index] = new Instrument(index);
        instrument.render(document.body);
    },

    '/parameter': function(instrument, key, value) {
        this.instruments[instrument].parameter(key, value);        
    },

    '/pattern': function(instrument, clip, index, value) {
        this.instruments[instrument].sequencer.setStep(clip, index, value);
    },

    '/slider': function(instrument, key, min, max, step) {
        this.instruments[instrument].slider(key, min, max, step);
        this.sliderSwitcher.addSlider(key);
    },

    '/automation': function(instrument, key, clip, index, value) {
        this.instruments[instrument].automation(key, clip, index, value);
    },

    '/clip': function(instrument, clip) {
        this.instruments[instrument].setClip(clip);
    },

    load: function(file) {
        $('.instrument').remove();
        this.instruments = [];
        this.send('load', file);
    },

    send: function (path) {
        var args = Array.prototype.slice.call(arguments, 0);

        $.post('/send/' + client_id + '/' + args.join('/'));
    },
    
    receive: function() {
        $.get('/receive/' + client_id, null, function(messages) {            
            messages = eval('(' + messages + ')');

            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];
                var address = message[0];
                var args = message[1];
                var fun = this[address];
                
                if (fun) {
                    fun.apply(this, args);
                    // log('receive: ' + address + ' ' + args.join(','));
                }
                else {
                    log('unsupported message:' + address);
                }
            }

            this.receive();
        }.bind(this));
    }
};