var sys    = require("sys");
var fs     = require('fs');
var http   = require("http");
var events = require('events');
var io     = require('./socket.io/lib/socket.io');
var _osc   = require('./osc/osc');

Function.prototype.bind = function(object) {
    var fn = this;
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        return fn.apply(object, args.concat(Array.prototype.slice.call(arguments, 0)));
    };
};

require.paths.unshift(__dirname + '/node-osc/lib');

var osc = require('osc');
var dgram = require('dgram');

var Instrument = function(sendPort, recvPort) {
    this.client = new _osc.Client(sendPort, '127.0.0.1');
    this.server = new osc.Server(recvPort, '127.0.0.1');
    // this.messages = [];

    // this.server.on('message', this.onMessage.bind(this));
};

Instrument.prototype = {
    send: function(message) {
        this.client.send(message);
    }
};

var instrument = new Instrument(10000, 20000);

function index(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile("index.html", function(err, file) {
        res.end(file);
    });
}

function file(req, res) {
    var type = 'text/plain';

    if (req.url.match(/\.html$/)) {
        type = 'text/html';
    }

    if (req.url.match(/\.js$/)) {
        type = 'text/javascript';
    }

    if (req.url.match(/\.css$/)) {
        type = 'text/css';
    }

    res.writeHead(200, {'Content-Type': type});
    fs.readFile(req.url.slice(1), function(err, file) {
        res.end(file);
    });
}

var routes = [
    [/^$/, index],
    [/.*/, file]
];

function controller(req, res) {
    sys.puts(req.url);

    for (var i = 0; i < routes.length; i++) {
        if (req.url.slice(1).match(routes[i][0])) {
            routes[i][1](req, res);
            return;
        }
    }
}

var server = http.createServer(controller);

server.listen(80, "127.0.0.1");

var io = io.listen(server);

io.on('connection', function(client) {

    instrument.server.on('message', function(message) {
        client.send({ message: message });
    });

    client.on('message', function(data) {
        var address = data.message[0];
        var types = data.message[1];
        var args = data.message.slice(2);
        var msg = new _osc.Message(address);

        for (var i in args) {
            msg.append(args[i], types[i]);
        }
        instrument.send(msg);
    });

    client.on('disconnect', function(){
    });
});
