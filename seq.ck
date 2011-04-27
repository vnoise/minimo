// OscRecv recv;
// 9998 => recv.port;
// recv.listen();

// Instrument instrument;
// instrument.init();

// recv.event("/instrument,ii") @=> OscEvent e;

// while (true) {
//     e => now;
//     while (e.nextMsg() != 0) {
//         instrument.listen(e.getInt());
//         instrument.setPort(e.getInt());
//         instrument.loop();
//     }
// }


Instrument instrument;
instrument.init();
instrument.listen(10000);
instrument.setPort(20000);
instrument.loop();