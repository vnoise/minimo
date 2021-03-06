var sys    = require("sys");
var fs     = require('fs');
var http   = require("http");
var events = require('events');
var io     = require('./socket.io/lib/socket.io');
var _osc   = require('./osc/osc');
var spawn  = require('child_process').spawn;
var os = require('os');

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

var Instrument = function(index) {
    events.EventEmitter.call(this);

    this.index = index;
    this.server = new osc.Server(20000 + this.index, '127.0.0.1');
    //this.client = new _osc.Client(10000 + this.index, '127.0.0.1');
    console.log('client intanziated mit Port  ' + 10000 + this.index);

    this.server.on('message', this.onMessage.bind(this));
};

Instrument.prototype = {
    __proto__: events.EventEmitter.prototype,

    send: function(message) {
        //this.client.send(message);
        console.log('instrument send msg ->   ' + message);
    },

    onMessage: function(message) {
        this.emit('message', message);
    }
};


function InstrumentManager() {
    events.EventEmitter.call(this);

    this.instruments = {};
	//this.client = new _osc.Client(9998, '127.0.0.1');
	console.log('client Instrument Manager ->  port 9998');
};

InstrumentManager.prototype = {
    __proto__: events.EventEmitter.prototype,
    
    send: function(index, message) {
        var instrument = this.instruments[index];

        if (instrument) {
            instrument.send(message);
        }
    },

    add: function(index) {
        var instrument = this.instruments[index] = new Instrument(index);
        instrument.on('message', this.onMessage.bind(this, index));

        var msg = new _osc.Message('/init');
        msg.append(index, 'i');
        console.log('client send ->   ' + msg);
        //this.client.send(msg);
        
    },

    onMessage: function(index, message) {
        this.emit('message', index, message);
    }

};

var instruments = new InstrumentManager();
var numInstruments = 4;

setTimeout(function() {
    for (var i = 0; i < numInstruments; i++) {
        instruments.add(i);
    }
}, 2000);


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

var clients = {};

//if (os.type().match(/CYGWIN*/)) {
/*    chuck_executable = "./chuck.exe";
}else{
    chuck_executable = "./chuck_OS_X";
}

var chuck = spawn( chuck_executable, 
                  ['./chuck/Parameter.ck',
                   './chuck/Mode.ck', 
                   './chuck/Instrument.ck', 
                   './chuck/seq.ck']);


chuck.stderr.on('data', function (data) {
    console.log(data.toString());
});

chuck.stdout.on('data', function (data) {
    console.log(data.toString());
});
*/


// var chuck = spawn('chuck', ['-s', 'test.ck', 'stream.ck']);
// var lame = spawn('lame', ['-', '-']);

// chuck.stdout.pipe(lame.stdin);

// lame.stdout.on('data', function (data) {
//     console.log(data.length);

//     for (id in clients) {
//         clients[id].write(data, 'binary');
//     }
// });

// chuck.stderr.on('data', function (data) {
//     console.log(data.toString());
// });

// lame.stderr.on('data', function (data) {
//     console.log(data.toString());
// });

// chuck.on('exit', function (code) {
//     console.log('chuck exited with code ' + code);
// });


// function stream(req, res) { 
//     res.writeHead(200,{
//         "Content-Type": "audio/mp3",
//         'Transfer-Encoding': 'chunked'
//     });


//     res.id = Number(new Date());

//     res.on('close', function() {
//         for (id in clients) {
//             if (id == res.id) {
//                 delete clients[id];
//             }
//         }       
//         console.log('Client disconnected: ' + res.id); 
//     });

//     clients[res.id] = res;

//     console.log('Client connected: ' + res.id); 
// }


var routes = [
    // [/^stream/, stream],
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

server.listen(80, "0.0.0.0");

var io = io.listen(server);

io.on('connection', function(client) {

    instruments.on('message', function(index, message) {
        client.send({ 
            instrument: index,
            address: message[0],
            args: message.slice(1)
        });
    });

    client.on('message', function(message) {
        // console.log(message);

        var types = message.types;
        var args = message.args;
        var msg = new _osc.Message(message.address);

        for (var i in args) {
            msg.append(args[i], types[i]);
        }

        instruments.send(message.instrument, msg);
        client.broadcast(message);
    });

    client.on('disconnect', function(){
    });
});
