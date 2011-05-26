var Controller = new Class({

    log: function(value) {
        if (this.console.childNodes[0]) {
            this.console.removeChild(this.console.childNodes[0]);
        }
        var text = document.createTextNode(value);
        this.console.appendChild(text);
    },

    initialize: function() {
        this.instruments = [];
        this.width = 800;
        this.height = 600;
        this.numInstruments = 1;

        this.svg = document.getElementById('svg');
        this.console = document.getElementById('console');

        this.root = new Widget({
            layout: 'horizontal',
            _svg: this.svg,
            container: this.svg,
            y: 50,
            width: this.width,
            height: this.height
        });
        
        this.touchtracker = new TouchTracker(this);

        for (var i = 0; i < this.numInstruments; i++) {
            this.create(i);
        }

        this.root.doLayout();
        this.root.draw();

        this.connect();
    },

    send: function(message) {
        this.socket.send(message);
    },

    connect: function() {
        this.socket = new io.Socket('192.168.2.127'); 
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