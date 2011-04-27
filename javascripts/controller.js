var controller = {
    instruments: [],

    initialize: function() {
        $(document.body).svg({
            width: 1600,
            height: 1000,
            onLoad: this.onLoad.bind(this)
        });        
    },

    send: function () {
        var args = Array.prototype.slice.call(arguments, 0);

        this.socket.send({ message: args });
    },

    onMessage: function(message) {
        this.instruments[0].receive(message.message);
    },

    onLoad: function(svg) {
        this.svg = svg;
        this.svg.root().setAttribute('width', 1600);
        this.svg.root().setAttribute('height', 1000);
        this.create(0);
    },

    create: function(index) {
        this.socket = new io.Socket('localhost'); 
        this.socket.connect();
        this.socket.on('connect', function() {
            console.log('connect');
            this.instruments[index].send('/update');
        }.bind(this));

        this.socket.on('message', this.onMessage.bind(this));
 
        this.socket.on('disconnect', function() {
            console.log('disconnect');
        });

        this.instruments[index] = new Instrument({
            controller: this,
            svg: this.svg,
            container: this.svg.root(),
            index: index,
            x: 320 * index,
            y: 0,
            width: 320,
            height: 1000
        });

        this.instruments[index].draw();
    }
};