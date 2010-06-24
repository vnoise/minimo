var controller = {
    clock: 0,
    instruments: [],

    initialize: function() {
        this.receive();
    },

    setClock: function (clock) {
        $.each(this.instruments, function() {
            this.clock(clock % 16); 
        });

        if (clock % 4 < 3) {
            setTimeout(this.setClock.bind(this, clock + 1), 125);
        }
    },

    '/clock': function(index) {
        this.setClock(index);
    },

    '/instrument': function(index) {
        var instrument = this.instruments[index] = new Instrument(index);
        instrument.render(document.body);
    },

    '/parameter': function(instrument, key, value) {
        // this.instruments[instrument].parameter(key, value);        
    },

    '/pattern': function(instrument, clip, index, value) {
        this.instruments[instrument].sequencer.setStep(clip, index, value);
    },

    '/slider': function(instrument, key, min, max, step) {
        this.instruments[instrument].slider(key, min, max, step);
    },

    '/automation': function(instrument, key, clip, index, value) {
        // this.instruments[instrument].automation(key, clip, index, value);
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