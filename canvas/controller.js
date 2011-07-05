var Controller = new Class({

    initialize: function() {
        this.instruments = [];
        this.numInstruments = 4;

        this.canvas = document.getElementById('canvas');

        this.root = new Widget({
            layout: 'horizontal'
        });

        for (var i = 0; i < this.numInstruments; i++) {
            this.create(i);
        }

        this.connect();
    },

    send: function(message) {
        this.socket.send(message);
    },

    connect: function() {
        this.socket = new io.Socket(location.host); 
        this.socket.connect();
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('message', this.onMessage.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
    },

    onConnect: function() {
        for (var i = 0; i < this.numInstruments; i++) {
            this.instruments[i].send('/update');
        }
    },

    onMessage: function(message) {
        // if (message.address != '/clock') {
        // console.log(message);
        // }

        var instrument = this.instruments[message.instrument];

        if (instrument) {
            instrument.receive(message);
        }
        else {
            console.log('instrument not found: ' + message.instrument);
        }
    },

    onDisconnect: function() {
        console.log('disconnect');
    },

    create: function(index) {
        this.instruments[index] = this.root.add({
            type: Instrument,
            marginRight: 5,
            controller: this,
            index: index
        });
    }
});