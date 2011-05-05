OscRecv recv;
Instrument @ instruments[16];
Instrument @ instrument;
int index;

9998 => recv.port;
recv.listen();

recv.event("/init,i") @=> OscEvent createEvent;

while (true) {
    createEvent => now;
    while (createEvent.nextMsg() != 0) {
        createEvent.getInt() => index;

        new Instrument @=> instrument;          
        instrument @=> instruments[index];
        10000 + index => instrument.recvPort;
        20000 + index => instrument.sendPort;
        instrument.init();
        spork ~ instrument.loop();
    }
}
