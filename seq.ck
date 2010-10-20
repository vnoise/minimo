OscRecv portReceiver;
9998 => portReceiver.port;
portReceiver.listen();

Instrument instrument;
instrument.init();

portReceiver.event("/port,i") @=> OscEvent e;

while (true) {
    e => now;    
    while (e.nextMsg() != 0) {
        instrument.listen(e.getInt());
        instrument.loop();
    }
}

