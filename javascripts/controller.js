var controller = {
    instruments: [],
    width: 2000,
    height: 1000,
    numInstruments: 4,

    send: function(message) {
        this.socket.send(message);
    },

    initialize: function() {
        this.svg = document.getElementById('svg');
        this.svg.setAttribute('width', this.width);
        this.svg.setAttribute('height', this.height);

        this.root = new Widget({
            _svg: this.svg,
            container: this.svg,
            width: this.width,
            height: this.height
        });
        
        TouchTracker.init(this.root, this.svg);

        for (var i = 0; i < this.numInstruments; i++) {
            this.create(i);
        }

        this.connect();
    },

    connect: function() {
        this.socket = new io.Socket('localhost'); 
        this.socket.connect();
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('message', this.onMessage.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
    },

    onConnect: function() {
        console.log('connect');

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
            index: index,
            x: 400 * index,
            y: 0,
            width: 320,
            height: 1000
        });

        this.instruments[index].draw();
    }
};