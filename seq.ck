class Instrument {
    SinOsc sinus;
    Noise noise;
    ADSR adsr;
    Gain gain;
    Gain output;
    float pattern[];
    
    [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] @=> pattern;

    noise => adsr;
    sinus => adsr;
    adsr => gain => output;

    adsr.set(0::ms, 100::ms, 0.0, 0::ms);

    public void play(int pos) {
        pattern[pos] => float level;

        if (level > 0) {
            level => gain.gain;
            adsr.keyOff();
            adsr.keyOn();
        }
    }
    
    public void connect(UGen ugen) {
        output => ugen;
    }
}

class Bassdrum extends Instrument {
    0 => noise.gain;
    80 => sinus.freq;
}

class Snare extends Instrument {
    0.5 => noise.gain;
    160 => sinus.freq;    
}

class Hihat extends Instrument {
    0 => sinus.gain;
    
    adsr.set(0::ms, 10::ms, 0.0, 0::ms);
}

Snare snare;
Bassdrum bassdrum;
Hihat hihat;

snare.connect(dac);
bassdrum.connect(dac);
hihat.connect(dac);

[bassdrum, snare, hihat] @=> Instrument instruments[];

OscRecv receiver;
3334 => receiver.port;
receiver.listen();

fun void receive(string path, string type) {
    receiver.event(path) @=> OscEvent e;
    
    while (true) {
        e => now;
        
        while (e.nextMsg() != 0) {
            e.getInt() => int index;

            instruments[index] @=> Instrument instrument;
            
            if (type == "pattern") {
                e.getInt() => int pos;
                e.getFloat() => float value;                
                value => instrument.pattern[pos];
            }
            
            if (type == "volume") {
                e.getFloat() => instrument.output.gain;
            }

            if (type == "noise") {
                e.getFloat() => instrument.noise.gain;
            }

            if (type == "sinus") {
                e.getFloat() => instrument.sinus.gain;
            }

            if (type == "freq") {
                e.getFloat() => instrument.sinus.freq;
            }
            
            if (type == "attack") {
                e.getFloat()::ms => instrument.adsr.attackTime;
            }
            
            if (type == "decay") {
                e.getFloat()::ms => instrument.adsr.decayTime;
            }
        }
    }
}

spork ~ receive("/pattern,iif", "pattern");
spork ~ receive("/volume,if", "volume");
spork ~ receive("/freq,if", "freq");
spork ~ receive("/noise,if", "noise");
spork ~ receive("/sinus,if", "sinus");
spork ~ receive("/attack,if", "attack");
spork ~ receive("/decay,if", "decay");

OscSend sender;
sender.setHost("localhost", 3335);

.25::second => dur T;
T - (now % T) => now;
0 => int i;

while( true )
{
    bassdrum.play(i);
    snare.play(i);
    hihat.play(i);

    sender.startMsg("/clock,i");
    sender.addInt(i);    

    .5::T => now;
    (i + 1) % 16 => i;
}