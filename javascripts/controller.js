var controller = {
    instruments: [],

    initialize: function() {
        $(document.body).svg({
            width: 1600,
            height: 1000,
            onLoad: this.onLoad.bind(this)
        });        
    },

    send: function(message) {
        this.socket.send(message);
    },

    onLoad: function(svg) {
        this.svg = svg;
        this.svg.root().setAttribute('width', 1600);
        this.svg.root().setAttribute('height', 1000);
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

        this.create(0);
        this.create(1);
    },

    onMessage: function(message) {
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
        this.instruments[index] = new Instrument({
            controller: this,
            svg: this.svg,
            container: this.svg.root(),
            index: index,
            x: 340 * index,
            y: 0,
            width: 320,
            height: 1000
        });

        this.instruments[index].draw();
        this.instruments[index].send('/update');
    }
};