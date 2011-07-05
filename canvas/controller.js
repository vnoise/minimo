var Controller = new Class({

    initialize: function() {
        this.instruments = [];
        this.width = 800;
        this.height = 500;
        this.numInstruments = 1;

        this.canvas = document.getElementById('canvas');

        this.root = new Widget({
            layout: 'horizontal',
            y: 50,
            width: this.width,
            height: this.height
        });
        
        this.touchtracker = new TouchTracker(this);

        for (var i = 0; i < this.numInstruments; i++) {
            this.create(i);
        }

        setInterval(this.onTick.bind(this), 50);

        this.connect();
    },

    onTick: function() {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);
        this.root.doLayout();
        this.root.draw(ctx);
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
        //     console.log(message);
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
            controller: this,
            index: index
        });
    }
});