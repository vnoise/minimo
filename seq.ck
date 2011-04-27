OscRecv recv;
Instrument @ instrument;

9998 => recv.port;
recv.listen();

recv.event("/instrument,ii") @=> OscEvent e;

while (true) {
    e => now;
    while (e.nextMsg() != 0) {
        new Instrument @=> instrument;

        instrument.init();
        instrument.listen(e.getInt());
        instrument.setPort(e.getInt());
        instrument.loop();
    }
}
