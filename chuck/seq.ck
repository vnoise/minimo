OscRecv recv;
Instrument @ instruments[16];
Instrument @ instrument;
int index;

Dyno master => dac;
master.limit();
0.8 => master.gain;

9998 => recv.port;
recv.listen();

recv.event("/init,i") @=> OscEvent createEvent;

while (true) {
    createEvent => now;
    while (createEvent.nextMsg() != 0) {
        createEvent.getInt() => index;

        new Instrument @=> instrument;          
        instrument @=> instruments[index];
        instrument.output => master;
        10000 + index => instrument.recvPort;
        20000 + index => instrument.sendPort;
        instrument.init();
        spork ~ instrument.loop();
    }
}
