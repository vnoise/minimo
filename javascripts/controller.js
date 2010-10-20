var controller = {
    clock: 0,
    instruments: [],

    initialize: function() {
        // this.scrollManager = new ScrollManager();
        // this.menu = $("<div class='menu'/>").appendTo(document.body);
        // this.console = $("<div class='console'/>").appendTo(document.body);

        // this.bpm = $('<input type="text" class="bpm" name="bpm" />').appendTo(this.menu);

        // this.bpm.keydown(function() {
        //     this.send('bpm', this.bpm.val());
        // }.bind(this));

        // $("<a href='#'>console</a>").appendTo(this.menu).click(function() {
        //     this.console.slideToggle();
        //     return false;
        // }.bind(this));

        // $("<a href='#'>automation</a>").appendTo(this.menu).click(this.toggleAutomation.bind(this));

        // $("<a href='#'>slider</a>").appendTo(this.menu).click(this.toggleSlider.bind(this));

        // $("<a href='#'>zoom</a>").appendTo(this.menu).click(this.toggleZoom.bind(this));

        // $("<a href='#'>save</a>").appendTo(this.menu).click(function() {
        //     controller.send('save');
        //     return false;
        // });

        // for (var i = 0; i < saves.length; i++) {
        //     var file = saves[i];
        //     $("<a href='#'>" + file + "</a>").appendTo(this.menu).click(function() {
        //         this.load(file);
        //     }.bind(this));     
        // }

        // this.sliderSwitcher = new SliderSwitcher(this.instruments);
        // this.sliderSwitcher.render(document.body);
        this.receive();
    },

    toggleAutomation: function(event) {
        var link = $(event.target);
        link.toggleClass('active');
        
        for (var i in this.instruments) {
            if (link.hasClass('active')) {
                this.instruments[i].showAutomation();
            }
            else {
                this.instruments[i].hideAutomation();
            }
        }

        return false;
    },

    toggleSlider: function(event) {
        var link = $(event.target);
        link.toggleClass('active');
        
        for (var i in this.instruments) {
            if (link.hasClass('active')) {
                this.instruments[i].showSlider();
            }
            else {
                this.instruments[i].hideSlider();
            }
        }

        return false;
    },

    toggleZoom: function(event) {
        var link = $(event.target);
        link.toggleClass('active');
        
        for (var i in this.instruments) {
            if (link.hasClass('active')) {
                var instrument = this.instruments[i];
                for (var key in instrument.automations) {
                    instrument.automations[key].setSize(160, 160);
                }
            }
            else {
                var instrument = this.instruments[i];
                for (var key in instrument.automations) {
                    instrument.automations[key].setSize(160, 40);
                }
            }
        }

        return false;
    },

    getBpm: function() {
        // return parseFloat(this.bpm.val());
        return 120;
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
        // this.bpm.val(bpm);
    },

    '/instrument': function(index) {
        var instrument = this.instruments[index] = new Instrument(index);
        instrument.render(document.body);
    },

    '/parameter': function(instrument, key, value) {
        instrument.parameter(key, value);        
    },

    '/pattern': function(instrument, clip, index, value) {
        instrument.sequencer.setStep(clip, index, value);
    },

    '/slider': function(instrument, key, min, max, step) {
        instrument.slider(key, min, max, step);
        // this.sliderSwitcher.addSlider(key);
    },

    '/automation': function(instrument, key, clip, index, value) {
        instrument.automation(key, clip, index, value);
    },

    '/clip': function(instrument, clip) {
        instrument.setClip(clip);
    },

    '/mode': function(instrument, mode) {
        instrument.setMode(mode);
    },

    '/sample': function(instrument, sample) {
        instrument.setSample(sample);
    },

    '/type': function(instrument, type) {
        instrument.setType(type);
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
            if (messages.length > 0) {
                messages = eval('(' + messages + ')');

                for (var i = 0; i < messages.length; i++) {
                    var message = messages[i];
                    var address = message[0];
                    var args = message[1];
                    var index = message[2];
                    var fun = this[address];

                    // if (address != '/clock')
                    //     log(address + ' ' + args.join(',') + ' ' + index);

                    if (index === null) {
                        fun.apply(this, args);
                    }
                    else {
                        var instrument = this.instruments[index];
                        if (instrument) {
                            fun.apply(this, [instrument].concat(args));
                        }
                    }
                }                
            }

            this.receive();
        }.bind(this));
    }
};